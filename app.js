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
    endpoint
  } = app.config;
  app.cache = blockCache;
  const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
  const status = await aelf.chain.getChainStatus();
  const BestChainHeight = parseInt(status.BestChainHeight, 10);
  app.config.currentHeight = BestChainHeight;
  app.config.lastHeight = BestChainHeight;
  getBlocksAndTxsFromChain(app, aelf, blockCache, BestChainHeight);
  const scheduler = new Scheduler({
    interval: app.config.broadcastInterval
  });
  scheduler.setCallback(() => {
    const list = [];
    const cacheList = app.cache.getCacheList();
    // eslint-disable-next-line no-unused-vars
    for (const item of cacheList) {
      if (item[0] > app.config.lastHeight) {
        list.push(item[1].value);
      }
    }
    if (list.length > 0) {
      app.io.of('/api/socket').emit('getBlocksList', list);
    }
  });
  scheduler.startTimer();
};
