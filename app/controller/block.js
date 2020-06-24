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
  block_hash: 'string'
};

class BlockController extends Controller {

  async getTransactions() {
    const { ctx } = this;
    try {
      const {
        limit, page, order, block_hash
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
        block_hash
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.block.getTransactions(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getTransaction() {
    const { ctx } = this;
    try {
      const {
        tx_id
      } = ctx.request.query;
      const result = await ctx.service.block.getTransactionInfo(tx_id);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getBlock() {
    const { ctx } = this;
    try {
      const {
        height
      } = ctx.request.query;
      const result = await ctx.service.block.getBlockInfo(height);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = BlockController;
