/**
 * @file controller/vote.js
 * @author huangzongzhe
 * 2019.01
 */
'use strict';

const Controller = require('egg').Controller;
const formatOutput = require('../utils/formatOutput.js');

class VoteController extends Controller {

    // TODO: 目前使用api/addres/transactions 能满足要求
    /**
     * 获取对应时间段的TPS信息
     * http://localhost:7101/api/tps/list?start_time=1543470081680&end_time=1543473081680
     *
     * @API getTransactions
     * @param {Number} start_time 毫秒级别
     * @param {Number} end_time 毫秒级别
     * @return {Object}
     */
    async getRecord() {
        let ctx = this.ctx;
        try {
            let {
                limit,
                page,
                order,
                address,
                type
            } = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
                address,
                type
            };
            // ctx.validate(keysRule, options);

            let result = await ctx.service.vote.getRecord(options);
            formatOutput(ctx, 'get', result);
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = VoteController;