/**
 * @file controller/resource.js
 * @author huangzongzhe
 * 2019.02
 */
const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

class ResourceController extends Controller {

  /**
   * 获取该地址资源交易记录
   *
   * @API getRecords
   * @param {number} limit not null
   * @param {number} page not null
   * @param {string} order not null
   * @param {string} address not null
   * @return {Object}
   */
  async getRecords() {
    const { ctx } = this;

    const keysRule = {
      order: 'string',
      limit: 'int',
      page: 'int',
      address: 'string'
    };

    try {
      const {
        limit,
        page,
        order,
        address
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
        address
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.resource.getRecords(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  /**
   * 获取实时资源交易记录
   * order by time desc
   *
   * @API getRealtimeRecords
   * @param {number} limit not null
   * @param {string} type not null
   * @return {Object}
   */
  async getRealtimeRecords() {
    const { ctx } = this;

    const keysRule = {
      limit: 'int',
      type: 'string'
    };

    try {
      const {
        limit,
        type
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        type
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.resource.getRealtimeRecords(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  /**
   * 获取交易额
   *
   * @API getTurnover
   * @param {number} limit not null
   * @param {number} page not null
   * @param {string} order not null
   * @param {number} interval not null
   * @param {string} type option
   * @return {Object}
   */
  async getTurnover() {
    const { ctx } = this;

    const keysRule = {
      interval: 'int',
      type: 'string'
    };

    try {
      const {
        interval,
        type
      } = ctx.request.query;
      const options = {
        ...ctx.request.query,
        interval: parseInt(interval, 10),
        type
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.resource.getTurnover(options);
      // formateTurnoverList(xxxx);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

}

module.exports = ResourceController;
