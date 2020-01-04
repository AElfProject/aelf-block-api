/**
 * @file ws blocks and txs
 */
const { Controller } = require('egg');

class BlocksAndTxsController extends Controller {
  async getBlocksList() {
    const { ctx, app } = this;
    const { redisKeys, currentHeight } = app.config;
    const totalTxs = await app.redis.get(redisKeys.txsCount);
    const unconfirmedBlockHeight = await app.redis.get(redisKeys.blocksUnconfirmedCount);
    const fullCacheList = Array.from(app.cache.block.getCacheList().values()).map(v => v.value);
    await ctx.socket.emit('getOnFirst', {
      height: currentHeight,
      unconfirmedBlockHeight,
      totalTxs,
      list: fullCacheList,
      accountNumber: app.cache.common.getCache('accountNumber') || 0
    });
  }
}

module.exports = BlocksAndTxsController;
