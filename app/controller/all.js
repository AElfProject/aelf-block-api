/*
 * huangzongzhe
 * 2018.08
 */


// 想想有没有什么更加合适的命名。。。

const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

const blocksRule = {
  order: 'string',
  limit: 'int',
  page: 'int'
};

class AllController extends Controller {

  async getAllBlocks() {
    const { ctx } = this;
    try {
      const { limit, page, order } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC'
      };
      ctx.validate(blocksRule, options);
      const result = await ctx.service.all.getAllBlocks(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getAllTransactions() {
    const { ctx } = this;
    try {
      const { limit, page, order } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      ctx.validate(blocksRule, options);
      const result = await ctx.service.all.getAllTransactions(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getUnconfirmedBlocks() {
    const { ctx } = this;
    try {
      const {
        limit = 25,
        page = 0,
        order = 'DESC'
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      ctx.validate(blocksRule, options);
      const result = await ctx.service.all.getUnconfirmedBlocks(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getUnconfirmedTransactions() {
    const { ctx } = this;
    try {
      const {
        limit = 25,
        page = 0,
        order = 'DESC'
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      ctx.validate(blocksRule, options);
      const result = await ctx.service.all.getUnconfirmedTransactions(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = AllController;
