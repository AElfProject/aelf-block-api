/**
 * @file controller/address.js
 * @author huangzongzhe
 * 2018.08
 */
/* eslint-disable fecs-camelcase */
'use strict';

const Controller = require('egg').Controller;
const formatOutput = require('../utils/formatOutput.js');

class AddressController extends Controller {

    /**
     * 获取该地址所有交易
     * 如果传入contract_address, 讲获取该地址下当前合约的交易。
     *
     * @API getTransactions
     * @param {number} limit not null
     * @param {number} page not null
     * @param {string} order not null
     * @param {string} address not null
     * @param {string} contract_address option
     * @return {Object}
     */
    async getTransactions() {
        let ctx = this.ctx;

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
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    /**
     * 获取该地址对应token的Balance 和 token的详细信息
     *
     * @API getBalance
     * @param {string} address not null
     * @param {contract_address} contract_address not null
     * @return {Object}
     */
    async getBalance() {
        let ctx = this.ctx;

        const keysRule = {
            address: 'string',
            contract_address: 'string'
        };

        try {
            let {
                address,
                contract_address
            } = ctx.request.query;
            let options = {
                address,
                contract_address
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.address.getBalance(options);
            let tokenDetail = await ctx.service.contract.getDetail(options);
            let output = {
                ...result,
                tokenDetail: tokenDetail[0]
            };
            formatOutput(ctx, 'get', output);
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    /**
     * 获取该地址对应的所有token
     *
     * @API getTokens
     * @param {string} address not null
     * @param {number} limit option
     * @param {number} page option
     * @param {string} order option
     * @return {Object}
     */
    async getTokens() {
        let ctx = this.ctx;

        const keysRule = {
            address: 'string',
            limit: {
                type: 'int',
                required: false,
                allowEmpty: true,
                max: 500,
                min: 0
            },
            page: {
                type: 'int',
                required: false,
                allowEmpty: true,
                min: 0
            },
            order: {
                type: 'string',
                required: false,
                allowEmpty: true
            },
            // When nodes_info = true, return without token balance.
            nodes_info: {
                type: 'boolean',
                required: false,
                allowEmpty: true
            }
        };

        try {
            let {
                address,
                limit,
                page,
                order,
                nodes_info
            } = ctx.request.query;
            let options = {
                address,
                limit: limit ? parseInt(limit, 10) : 0,
                page: page ? parseInt(page, 10) : 0,
                order: order || 'DESC',
                nodes_info: !!nodes_info || false
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.address.getTokens(options);
            formatOutput(ctx, 'get', result);
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    /**
     * 为当前地址绑定一个新的token
     *
     * @API getTokens
     * @param {string} address
     * @param {string} contract_address
     * @param {string} signed_address
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
                address,
                contract_address,
                signed_address,
                public_key
            };
            let result = await ctx.service.address.bindToken(options);
            formatOutput(ctx, 'post', result);
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

    /**
     * 为当前地址解绑一个token
     *
     * @API unbindTokens
     * @param {string} address
     * @param {string} contract_address
     * @param {string} signed_address
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
                address,
                contract_address,
                signed_address,
                public_key
            };
            let result = await ctx.service.address.unbindToken(options);
            formatOutput(ctx, 'get', result);
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = AddressController;
