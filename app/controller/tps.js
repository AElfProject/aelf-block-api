/*
 * huangzongzhe
 * 2018.11
 */


const { Controller } = require('egg');
const moment = require('moment');
const formatOutput = require('../utils/formatOutput.js');

const keysRule = {
  start_time: 'number',
  end_time: 'number',
};

class TpsController extends Controller {

  /**
     * 获取对应时间段的TPS信息
     * http://localhost:7101/api/tps/list?start_time=1543470081680&end_time=1543473081680
     *
     * @API getTransactions
     * @param {Number} start_time 毫秒级别
     * @param {Number} end_time 毫秒级别
     * @return {Object}
     */
  async getTps() {
    const { ctx } = this;
    try {
      const { start_time, end_time, order } = ctx.request.query;
      const options = {
        start_time: parseInt(start_time, 10) / 1000,
        end_time: parseInt(end_time, 10) / 1000,
        order: order || 'DESC'
      };
      ctx.validate(keysRule, options);

      options.start_time = moment.unix(options.start_time).utc().format();
      options.end_time = moment.unix(options.end_time).utc().format();

      const result = await ctx.service.tps.getTps(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = TpsController;
