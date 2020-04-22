/**
 * @file app
 * @author atom-yang
 */
const ioClient = require('socket.io-client');
const AElf = require('aelf-sdk/dist/aelf.cjs');
const getBlocksAndTxsFromChain = require('./app/utils/getBlocksAndTxsFromChain');
const CacheService = require('./app/utils/cache');
const Scheduler = require('./app/utils/scheduler');

async function getCount(app) {
  const aelf0 = app.mysql.get('aelf0');
  const sql = 'select COUNT(DISTINCT address_from) AS total from transactions_0';
  const count = await aelf0.query(sql);
  return count[0].total || 0;
}

async function getTokenDecimals(app) {
  const aelf0 = app.mysql.get('aelf0');
  const sql = 'select symbol, decimals from contract_aelf20';
  const result = await aelf0.query(sql);
  return result.reduce((acc, v) => ({
    ...acc,
    [v.symbol]: v.decimals
  }), {});
}

function createCommonCache(app) {
  const cache = new CacheService();
  const accountNumberCacheKey = 'accountNumber';
  const tokenDecimalsCacheKey = 'tokenDecimals';
  const commonCacheList = {
    [accountNumberCacheKey]: {
      initialValue: 0,
      cacheConfig: {
        expireTimeout: 25 * 60 * 1000,
        autoUpdate: true,
        update: async () => {
          const total = await getCount(app);
          cache.setCache(accountNumberCacheKey, total);
        }
      }
    },
    [tokenDecimalsCacheKey]: {
      initialValue: {},
      cacheConfig: {
        expireTimeout: 25 * 60 * 1000,
        autoUpdate: true,
        update: async () => {
          const result = await getTokenDecimals(app);
          cache.setCache(tokenDecimalsCacheKey, result);
        }
      }
    }
  };
  Object.entries(commonCacheList).map(async ([ key, value ]) => {
    cache.initCache(key, value.initialValue, value.cacheConfig);
    await value.cacheConfig.update();
  });
  return cache;
}

const SIDE_CHAIN_DATA_REDIS_KEY = 'side_chain_data';

module.exports = async app => {
  const blockCache = new CacheService();
  const {
    endpoint,
    redisKeys,
    sideChainAPI
  } = app.config;
  app.cache = {};
  app.cache.block = blockCache;
  app.cache.common = createCommonCache(app);
  const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
  const status = await aelf.chain.getChainStatus();
  app.config.heightKey = 'BestChainHeight';
  const height = parseInt(status[app.config.heightKey], 10);
  app.config.currentHeight = height;
  app.config.lastHeight = height;
  getBlocksAndTxsFromChain(app, aelf, blockCache, height);
  const scheduler = new Scheduler({
    interval: app.config.broadcastInterval
  });
  scheduler.setCallback(async () => {
    const list = [];
    const cacheList = app.cache.block.getCacheList();
    // eslint-disable-next-line no-unused-vars
    for (const item of cacheList) {
      if (item[0] > app.config.lastHeight) {
        list.push(item[1].value);
      }
    }
    if (list.length > 0 && Object.keys(app.io.of('/').clients().connected).length > 0) {
      const sideChainData = JSON.parse(await app.redis.get(SIDE_CHAIN_DATA_REDIS_KEY));
      const sideData = Object.values(sideChainData || {});
      const confirmedTx = await app.redis.get(redisKeys.txsCount);
      const unconfirmedTx = await app.redis.get(redisKeys.txsUnconfirmedCount);
      const totalTxs = parseInt(confirmedTx, 10) + parseInt(unconfirmedTx, 10);
      const unconfirmedBlockHeight = await app.redis.get(redisKeys.blocksUnconfirmedCount);
      const accountNumber = app.cache.common.getCache('accountNumber') || 0;
      app.io.of('/').emit('getBlocksList', {
        height: app.config.currentHeight,
        unconfirmedBlockHeight,
        totalTxs,
        list,
        accountNumber,
        allChainTxs: totalTxs + sideData.reduce((acc, v) => acc + v.totalTxs || 0, 0),
        allChainAccount: accountNumber + sideData.reduce((acc, v) => acc + v.accountNumber || 0, 0)
      });
    }
  });
  scheduler.startTimer();
  const sideChainData = sideChainAPI.reduce((acc, v) => (
    {
      ...acc,
      [v]: {}
    }
  ), {});
  await app.redis.set(SIDE_CHAIN_DATA_REDIS_KEY, JSON.stringify(sideChainData));
  // eslint-disable-next-line no-unused-vars
  for (const url of sideChainAPI) {
    const socket = ioClient(url, {
      path: '/socket',
      transports: [ 'websocket', 'polling' ]
    });
    socket.on('getBlocksList', async data => {
      const {
        totalTxs = 0,
        accountNumber = 0
      } = data;
      const sideChainData = JSON.parse(await app.redis.get(SIDE_CHAIN_DATA_REDIS_KEY));
      await app.redis.set(SIDE_CHAIN_DATA_REDIS_KEY, JSON.stringify({
        ...sideChainData,
        [url]: {
          totalTxs,
          accountNumber
        }
      }));
    });
    socket.emit('getBlocksList');
  }
};
