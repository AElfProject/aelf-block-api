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
    chain_id: {
        type: 'string',
        required: false,
        allowEmpty: true
    }
};

class ContractController extends Controller {

    /**
     * 获取合约的详细信息
     *
     * @API getDetail
     * @param {String} contract_address
     * @return {Object}
     */
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

    /**
     * 获取所有合约
     * api/contract/contracts?limit=1000&page=0
     *
     * 如果传入chain_id, 讲获取当前链发布的合约
     * api/contract/contracts?limit=1000&page=0&chain_id=a7cd510bb89edbe314d0c6ebff27844bab1e5f5e94a4ac04ae68a0813d283d2a
     *
     * @API getTransactions
     * @param {Number} limit
     * @param {Number} page
     * @param {String} order
     * @param {String} chain_id option
     * @return {Object}
     */
    async getContracts() {
        let ctx = this.ctx;
        try {
            let {limit, page, order, chain_id} = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'ASC',
                chain_id: chain_id || ''
            };
            console.log('options: ', options);
            ctx.validate(keysRule, options);
            let result = await ctx.service.contract.getContracts(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = ContractController;