/**
 * @file controller/address.js
 * @author huangzongzhe
 * 2018.08
 */
const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

class AddressController extends Controller {

  /**
   * 获取该地址所有交易
   * 如果传入contract_address, 讲获取该地址下当前合约的交易。
   * getTransactions
   * @param {number} limit not null
   * @param {number} page not null
   * @param {string} order not null
   * @param {string} address not null
   * @param {string} contract_address option
   * @return {Object}
   */
  async getTransactions() {
    const { ctx } = this;

    const keysRule = {
      order: 'string',
      limit: {
        type: 'int',
        max: 1000,
        min: 0
      },
      page: 'int',
      address: 'string',
      contract_address: {
        type: 'string',
        required: false,
        allowEmpty: true
      }
    };

    try {
      const {
        limit,
        page,
        order,
        address,
        contract_address,
        method
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
        address,
        contract_address: contract_address || '',
        method: method || null
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.address.getTransactions(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
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
    const { ctx } = this;

    const keysRule = {
      address: 'string',
      contract_address: 'string'
    };

    try {
      const {
        address,
        contract_address
      } = ctx.request.query;
      const options = {
        address,
        contract_address
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.address.getBalance(options);
      const tokenDetail = await ctx.service.contract.getDetail(options);
      const output = {
        ...result,
        tokenDetail: tokenDetail[0]
      };
      formatOutput(ctx, 'get', output);
    } catch (error) {
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
    const { ctx } = this;

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
      const {
        address,
        limit,
        page,
        order,
        nodes_info
      } = ctx.request.query;
      const options = {
        address,
        limit: limit ? parseInt(limit, 10) : 0,
        page: page ? parseInt(page, 10) : 0,
        order: order || 'DESC',
        nodes_info: !!nodes_info || false
      };
      ctx.validate(keysRule, options);
      const result = await ctx.service.address.getTokens(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  /**
   * 为当前地址绑定一个新的token
   *
   * @API getTokens
   * @param {string} address
   * @param {string} contract_address
   * @param {string} symbol
   * @param {string} signed_address
   * @param {Object} public_key
   * @return {Object}
   */
  // 这里涉及到加密计算，如果被大量请求，服务器可能扛不住。
  async bindToken() {
    // 只有该用户是这个地址拥有者的前提下，才能插入数据。
    // 前端提前存好这两个数据。私钥签名的公钥。和公钥。
    const { ctx } = this;
    try {
      const {
        address,
        contract_address,
        symbol,
        signed_address,
        public_key
      } = ctx.request.body;
      const options = {
        address,
        contract_address,
        symbol,
        signed_address,
        public_key
      };
      const result = await ctx.service.address.bindToken(options);
      formatOutput(ctx, 'post', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  /**
   * 为当前地址解绑一个token
   *
   * @API unbindTokens
   * @param {string} address
   * @param {string} contract_address
   * @param {string} symbol
   * @param {string} signed_address
   * @param {Object} public_key
   * @return {Object}
   */
  // 这里涉及到加密计算，如果被大量请求，服务器可能扛不住。
  async unbindToken() {
    // 只有该用户是这个地址拥有者的前提下，才能插入数据。
    // 前端提前存好这两个数据。私钥签名的公钥。和公钥。
    const { ctx } = this;
    try {
      const {
        address,
        contract_address,
        symbol,
        signed_address,
        public_key
      } = ctx.request.body;
      const options = {
        address,
        contract_address,
        symbol,
        signed_address,
        public_key
      };
      const result = await ctx.service.address.unbindToken(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = AddressController;
