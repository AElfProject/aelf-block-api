/*
 * huangzongzhe
 * 2018.08
 */


// 想想有没有什么更加合适的命名。。。

const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

const keysRule = {
  order: 'string',
  limit: 'int',
  page: 'int',
  chain_id: 'string'
};

class ChainController extends Controller {

  async getBlocks() {
    const { ctx } = this;
    try {
      const {
        limit, page, order, chain_id
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
        chain_id
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.chain.getBlocks(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getTransactions() {
    const { ctx } = this;
    try {
      const {
        limit, page, order, chain_id
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
        chain_id
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.chain.getTransactions(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = ChainController;
