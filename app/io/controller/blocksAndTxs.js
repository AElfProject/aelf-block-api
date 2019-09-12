/**
 * @file ws blocks and txs
 */
const { Controller } = require('egg');

class BlocksAndTxsController extends Controller {
  async getBlocksList() {
    const { ctx, app } = this;
    const fullCacheList = Array.from(app.cache.getCacheList().values()).map(v => v.value);
    await ctx.socket.emit('getOnFirst', fullCacheList);
  }
}

module.exports = BlocksAndTxsController;
