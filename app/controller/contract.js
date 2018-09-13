/*
 * huangzongzhe
 * 2018.08
 */
'use strict';

// 想想有没有什么更加合适的命名。。。

const Controller = require('egg').Controller;
const formatOutput = require('../utils/formatOutput.js');

// const keysRule = {
//     order: 'string',
//     limit: 'int',
//     page: 'int',
//     address: 'string'
// };

class ContractController extends Controller {

    async getDetail() {
        let ctx = this.ctx;
        try {
            let { contract_address } = ctx.request.query;
            let options = {
                contract_address: contract_address
            };
            let result = await ctx.service.contract.getDetail(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = ContractController;