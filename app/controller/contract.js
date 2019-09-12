/**
 * @file contract.js
 * @author huangzongzhe
 * 2018.08
 */

const { Controller } = require('egg');
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
    const { ctx } = this;
    try {
      const { contract_address } = ctx.request.query;
      const options = {
        contract_address
      };
      const result = await ctx.service.contract.getDetail(options);
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
    const { ctx } = this;
    try {
      const {
        limit, page, order, chain_id
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'ASC',
        chain_id: chain_id || ''
      };
      console.log('options: ', options);
      ctx.validate(keysRule, options);
      const result = await ctx.service.contract.getContracts(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  /**
   * 插入token合约
   * api/contract/contracts
   *
   * @API insertContract
   * @param {number} contract_address not null
   * @param {string} chain_id not null
   * @param {string} block_hash not null
   * @param {string} tx_id not null
   * @param {string} symbol not null
   * @param {string} name not null
   * @param {number} total_supply not null
   * @param {number} decimals not null
   * @return {Object}
   */
  async insertContract() {
    const { ctx } = this;
    try {
      const {
        contract_address,
        chain_id,
        block_hash,
        tx_id,
        symbol,
        name,
        total_supply,
        decimals
      } = ctx.request.body;
      const options = {
        contract_address,
        chain_id,
        block_hash,
        tx_id,
        symbol,
        name,
        total_supply,
        decimals
      };
      // console.log('options: ', options);
      const result = await ctx.service.contract.insertContract(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  /**
   * 模糊查询Tokens
   *
   * @API searchToken
   * @param {string} name options
   * @param {string} order options
   * @return {Object}
   */
  async searchToken() {
    const { ctx } = this;
    try {
      const { name, order } = ctx.request.query;
      const options = {
        name,
        order: order || 'ASC'
      };
      console.log('options: ', options);
      const result = await ctx.service.contract.searchToken(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = ContractController;
