/*
 * huangzongzhe
 * 2018.08
 */
'use strict';

// 想想有没有什么更加合适的命名。。。

const Controller = require('egg').Controller;
const formatOutput = require('../utils/formatOutput.js');

const blocksRule = {
    order: 'string',
    limit: 'int',
    page: 'int'
};

class AllController extends Controller {

    async getAllBlocks() {
        let ctx = this.ctx;
        try {
            let {limit, page, order} = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
            };
            ctx.validate(blocksRule, options);
            let result = await ctx.service.all.getAllBlocks(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    async getAllTransactions() {
        let ctx = this.ctx;
        try {
            let {limit, page, order} = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
            };
            ctx.validate(blocksRule, options);
            let result = await ctx.service.all.getAllTransactions(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = AllController;