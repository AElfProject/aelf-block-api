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
    block_hash: 'string'
};

class BlockController extends Controller {

    async getTransactions() {
        let ctx = this.ctx;
        try {
            let {limit, page, order, block_hash} = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
                block_hash: block_hash
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.block.getTransactions(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = BlockController;