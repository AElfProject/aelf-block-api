/*
 * huangzongzhe
 * 2018.10
 * 暂时没有使用
 * 后续如果需要使用，需要翻墙使用。
 */
'use strict';

const Controller = require('egg').Controller;
const formatOutput = require('../utils/formatOutput.js');

// const transactionsRule = {
//     address: 'string',
//     limit: 'int',
//     page: 'int'
// };

class HuobiController extends Controller {

    async getDetail() {
        let ctx = this.ctx;
        try {
            let {
                symbol
            } = ctx.request.query;
            let options = {
                symbol: symbol
            };
            // ctx.validate(transactionsRule, options);
            let result = await ctx.service.huobi.getDetail(options);
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