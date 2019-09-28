/**
 * @file app
 * @author atom-yang
 */
const AElf = require('aelf-sdk/dist/aelf.cjs');
const getBlocksAndTxsFromChain = require('./app/utils/getBlocksAndTxsFromChain');
const CacheService = require('./app/utils/cache');
const Scheduler = require('./app/utils/scheduler');

module.exports = async app => {
  const blockCache = new CacheService();
  const {
    endpoint,
    redisKeys
  } = app.config;
  app.cache = blockCache;
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
    const cacheList = app.cache.getCacheList();
    // eslint-disable-next-line no-unused-vars
    for (const item of cacheList) {
      if (item[0] > app.config.lastHeight) {
        list.push(item[1].value);
      }
    }
    if (list.length > 0 && Object.keys(app.io.of('/').clients().connected).length > 0) {
      const totalTxs = await app.redis.get(redisKeys.txsCount);
      const unconfirmedBlockHeight = await app.redis.get(redisKeys.blocksUnconfirmedCount);
      app.io.of('/').emit('getBlocksList', {
        height: app.config.currentHeight,
        unconfirmedBlockHeight,
        totalTxs,
        list
      });
    }
  });
  scheduler.startTimer();
};
