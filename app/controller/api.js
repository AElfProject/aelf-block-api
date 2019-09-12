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
      formatOutput(ctx, 'get', result);
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
      formatOutput(ctx, 'post', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = ApiController;
