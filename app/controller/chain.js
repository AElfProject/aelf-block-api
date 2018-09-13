/*
 * huangzongzhe
 * 2018.08
 */
'use strict';

// 想想有没有什么更加合适的命名。。。

const Controller = require('egg').Controller;
const formatOutput = require('../utils/formatOutput.js');

const keysRule = {
    order: 'string',
    limit: 'int',
    page: 'int',
    chain_id: 'string'
};

class ChainController extends Controller {

    async getBlocks() {
        let ctx = this.ctx;
        try {
            let {limit, page, order, chain_id} = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
                chain_id: chain_id
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.chain.getBlocks(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    async getTransactions() {
        let ctx = this.ctx;
        try {
            let {limit, page, order, chain_id} = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
                chain_id: chain_id
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.chain.getTransactions(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = ChainController;