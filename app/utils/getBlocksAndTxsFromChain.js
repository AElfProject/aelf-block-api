/**
 * @file get blocks and txs results from chain
 * @author atom-yang
 * @date 2019.09.09
 */
const Scheduler = require('./scheduler');

async function getTxs(aelf, blockHash, limit = 100) {
  const txs = await aelf.chain.getTxResults(blockHash, 0, limit);
  return txs;
}

async function getBlock(aelf, height) {
  const blockInfo = await aelf.chain.getBlockByHeight(height, true);
  if (!blockInfo) {
    throw new Error(`empty block at height ${height}`);
  }
  const { BlockHash } = blockInfo;
  const txs = await getTxs(aelf, BlockHash);
  return {
    block: blockInfo,
    txs
  };
}

async function getBlocks(aelf, lastHeight) {
  const status = await aelf.chain.getChainStatus();
  const BestChainHeight = parseInt(status.BestChainHeight, 10);
  let gap = BestChainHeight - lastHeight;
  gap = gap <= 0 ? 0 : gap;
  const gapArr = new Array(gap || 0).fill(1).map((_, index) => index + lastHeight + 1);
  const results = await Promise.all(gapArr.map(v => getBlock(aelf, v)));
  return {
    results,
    currentHeight: BestChainHeight
  };
}

const cacheConfig = {
  expireTimeout: 180000 // ms
};

function getBlocksAndTxsFromChain(app, aelf, cache, startHeight) {
  let lastHeight = startHeight;
  const scheduler = new Scheduler({
    interval: app.config.broadcastInterval
  });
  scheduler.setCallback(async () => {
    try {
      const {
        results,
        currentHeight
      } = await getBlocks(aelf, lastHeight);
      if (results.length === 0) {
        return;
      }
      results.forEach(value => {
        const height = value.block.Header.Height;
        cache.initCache(height, value, cacheConfig);
      });
      lastHeight = currentHeight;
      app.config.lastHeight = app.config.currentHeight;
      app.config.currentHeight = currentHeight;
    } catch (e) {
      console.log(e);
    }
  });
  scheduler.startTimer();
}

module.exports = getBlocksAndTxsFromChain;
