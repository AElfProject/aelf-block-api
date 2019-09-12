/*
 * huangzongzhe
 * 2018.10
 * 暂时没有使用
 * 后续如果需要使用，需要翻墙使用。
 */


const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

// const transactionsRule = {
//     address: 'string',
//     limit: 'int',
//     page: 'int'
// };

class HuobiController extends Controller {

  async getDetail() {
    const { ctx } = this;
    try {
      const {
        symbol
      } = ctx.request.query;
      const options = {
        symbol
      };
      // ctx.validate(transactionsRule, options);
      const result = await ctx.service.huobi.getDetail(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  // async getHistoryTrade() {
  //     let ctx = this.ctx;
  //     try {
  //         let {
  //             symbol
  //         } = ctx.request.query;
  //         let options = {
  //             symbol: symbol
  //         };
  //         // ctx.validate(transactionsRule, options);
  //         let result = await ctx.service.huobi.getDetail(options);
  //         formatOutput(ctx, 'get', result);
  //     } catch (error) {
  //         formatOutput(ctx, 'error', error, 422);
  //     }
  // }
}

module.exports = HuobiController;
