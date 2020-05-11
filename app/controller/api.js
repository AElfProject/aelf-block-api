const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

const transactionsRule = {
  address: 'string',
  limit: 'int',
  page: 'int'
};

class ApiController extends Controller {

  async getAllBlocks() {
    const { ctx } = this;
    try {
      const { limit, page, order } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      // ctx.validate(transactionsRule, options);
      const result = await ctx.service.api.getAllBlocks(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getTransactions() {
    const { ctx } = this;
    try {
      const { address, limit, page } = ctx.request.query;
      const options = {
        address,
        limit: parseInt(limit, 10),
        page: parseInt(page, 10)
      };
      ctx.validate(transactionsRule, options);
      const result = await ctx.service.api.transactions(options);
      formatOutput(ctx, 'get', await this.service.getTransferAmount.filter(result));
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async postTransactions() {
    const { ctx } = this;
    try {
      const { address, limit, page } = ctx.request.body;
      const options = {
        address,
        limit: parseInt(limit, 10),
        page: parseInt(page, 10)
      };
      ctx.validate(transactionsRule, options);
      const result = await ctx.service.api.transactions(options);
      formatOutput(ctx, 'post', await this.service.getTransferAmount.filter(result));
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getChainInfo() {
    const {
      ctx,
      app
    } = this;
    const {
      redisKeys,
      currentHeight
    } = app.config;
    const totalTxs = await app.redis.get(redisKeys.txsCount);
    const unconfirmedBlockHeight = await app.redis.get(redisKeys.blocksUnconfirmedCount);
    // const fullCacheList = Array.from(app.cache.block.getCacheList().values()).map(v => v.value);
    formatOutput(ctx, 'get', {
      height: currentHeight,
      unconfirmedBlockHeight,
      totalTxs,
      // list: fullCacheList,
      accountNumber: app.cache.common.getCache('accountNumber') || 0
    });
  }
}

module.exports = ApiController;
