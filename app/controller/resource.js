/**
 * @file controller/resource.js
 * @author huangzongzhe
 * 2019.02
 */
/* eslint-disable fecs-camelcase */
'use strict';

const Controller = require('egg').Controller;
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
        let ctx = this.ctx;

        const keysRule = {
            order: 'string',
            limit: 'int',
            page: 'int',
            address: 'string'
        };

        try {
            let {
                limit,
                page,
                order,
                address
            } = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
                address
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.resource.getRecords(options);
            formatOutput(ctx, 'get', result);
        }
        catch (error) {
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
        let ctx = this.ctx;

        const keysRule = {
            limit: 'int',
            type: 'string'
        };

        try {
            let {
                limit,
                type
            } = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                type
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.resource.getRealtimeRecords(options);
            formatOutput(ctx, 'get', result);
        }
        catch (error) {
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
        let ctx = this.ctx;

        const keysRule = {
            interval: 'int',
            type: 'string'
        };

        try {
            let {
                interval,
                type
            } = ctx.request.query;
            let options = {
                interval: parseInt(interval, 10),
                type
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.resource.getTurnover(options);
            // formateTurnoverList(xxxx);
            formatOutput(ctx, 'get', result);
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

}

module.exports = ResourceController;

// 这种计算丢前端就好了，减少服务器的压力。
// {"buyRecords":[{"count":2,"time":1549957132906}],"sellRecords":[{"count":1,"time":1549957217107}]}
// const time = (new Date()).getTime();
// function formateTurnoverList(input, interval, limit, order, time) {
//     let timeList = [];
//     for (let i = 0; i < limit; i++) {
//         timeList.push(time - interval * i);
//     }

//     const buyRecords = input.buyRecords;
//     const sellRecords = input.sellRecords;

//     let output = timeList.map(timeListItem => {
//         // 合并对应时间段的 买卖数据
//         // 判断这个时间段买入还是卖出的量更大
//         const buyList = buyRecords.find(inputItem => {
//             return inputItem.time > timeListItem && inputItem.time < (timeListItem + interval);
//         });
//         const sellList = sellRecords.find(inputItem => {
//             return inputItem.time > timeListItem && inputItem.time < (timeListItem + interval);
//         });
//         // if (list) {
//         //     return {
//         //         count: list.count,
//         //         time: timeListItem
//         //     };
//         // }
//         return {
//             time: timeListItem,
//             buyList,
//             sellList
//             // time: timeListItem
//         };
//     });
//     if (order.toLocaleLowerCase() === 'asc') {
//         return output.reverse();
//     }
//     return output;
// }
