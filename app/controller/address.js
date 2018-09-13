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
    address: 'string'
};

class AddressController extends Controller {

    async getTransactions() {
        let ctx = this.ctx;
        try {
            let {limit, page, order, address} = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
                address: address
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.address.getTransactions(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    async getBalance() {
        let ctx = this.ctx;
        try {
            let { address, contract_address } = ctx.request.query;
            let options = {
                address: address,
                contract_address: contract_address
            };
            let result = await ctx.service.address.getBalance(options);
            let tokenDetail = await ctx.service.contract.getDetail(options);
            let output = {
                ...result,
                tokenDetail: tokenDetail[0]
            }
            formatOutput(ctx, 'get', output);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    async getTokens() {
        let ctx = this.ctx;
        try {
            let { address } = ctx.request.query;
            let options = {
                address: address
            };
            let result = await ctx.service.address.getTokens(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    async insertToken() {
        let ctx = this.ctx;
        try {
            // let { address, contract_address } = ctx.request.body;
            let { address, contract_address } = ctx.request.query;
            let options = {
                address: address,
                contract_address: contract_address
            };
            let result = await ctx.service.address.insertToken(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = AddressController;