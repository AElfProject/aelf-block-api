/*
 * huangzongzhe
 * 2018.08
 */
'use strict';

const Controller = require('egg').Controller;
const formatOutput = require('../utils/formatOutput.js');

const keysRule = {
    order: 'string',
    limit: 'int',
    page: 'int',
    address: 'string',
    contract_address: {
        type: 'string',
        required: false,
        allowEmpty: true
    }
};

class AddressController extends Controller {

    /**
     * 获取该地址所有交易
     * 如果传入contract_address, 讲获取该地址下当前合约的交易。
     *
     * @API getTransactions
     * @param {Number} limit
     * @param {Number} page
     * @param {String} order
     * @param {String} address
     * @param {String} contract_address option
     * @return {Object}
     */
    async getTransactions() {
        let ctx = this.ctx;
        try {
            let {
                limit,
                page,
                order,
                address,
                contract_address
            } = ctx.request.query;
            let options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC',
                address: address,
                contract_address: contract_address || ''
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.address.getTransactions(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    /**
     * 获取该地址对应token的Balance 和 token的详细信息
     *
     * @API getBalance
     * @param {String} address
     * @param {contract_address} contract_address
     * @return {Object}
     */
    async getBalance() {
        let ctx = this.ctx;
        try {
            let {
                address,
                contract_address
            } = ctx.request.query;
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

    /**
     * 获取该地址对应的所有token
     *
     * @API getTokens
     * @param {String} address
     * @param {Number} limit option
     * @param {Number} page option
     * @param {String} order option
     * @return {Object}
     */
    async getTokens() {
        let ctx = this.ctx;
        try {
            let {
                address,
                limit,
                page,
                order
            } = ctx.request.query;
            let options = {
                address: address,
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                order: order || 'DESC'
            };
            let result = await ctx.service.address.getTokens(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    /**
     * 为当前地址绑定一个新的token
     *
     * @API getTokens
     * @param {String} address
     * @param {String} contract_address
     * @param {String} signed_address
     * @param {Object} public_key
     * @return {Object}
     */
    // 这里涉及到加密计算，如果被大量请求，服务器可能扛不住。
    async bindToken() {
        // 只有该用户是这个地址拥有者的前提下，才能插入数据。
        // 前端提前存好这两个数据。私钥签名的公钥。和公钥。
        let ctx = this.ctx;
        try {
            let {
                address,
                contract_address,
                signed_address,
                public_key
            } = ctx.request.body;
            let options = {
                address: address,
                contract_address: contract_address,
                signed_address: signed_address,
                public_key: public_key
            };
            let result = await ctx.service.address.bindToken(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    /**
     * 为当前地址解绑一个token
     *
     * @API unbindTokens
     * @param {String} address
     * @param {String} contract_address
     * @param {String} signed_address
     * @param {Object} public_key
     * @return {Object}
     */
    // 这里涉及到加密计算，如果被大量请求，服务器可能扛不住。
    async unbindToken() {
        // 只有该用户是这个地址拥有者的前提下，才能插入数据。
        // 前端提前存好这两个数据。私钥签名的公钥。和公钥。
        let ctx = this.ctx;
        try {
            let {
                address,
                contract_address,
                signed_address,
                public_key
            } = ctx.request.body;
            let options = {
                address: address,
                contract_address: contract_address,
                signed_address: signed_address,
                public_key: public_key
            };
            let result = await ctx.service.address.unbindToken(options);
            formatOutput(ctx, 'get', result);
        } catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = AddressController;
