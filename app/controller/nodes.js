/**
 * @file controller/nodes.js
 * @author huangzongzhe
 * 2018.08
 */
const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

const stringAllowEmptyType = {
  type: 'string',
  required: false,
  allowEmpty: true
};

const postNodesInfoKeysRule = {
  contract_address: 'string',
  chain_id: 'string',
  api_ip: 'string',
  api_domain: stringAllowEmptyType,
  rpc_ip: 'string',
  rpc_domain: stringAllowEmptyType,
  token_name: 'string',
  owner: 'string',
  status: 'int'
};

const putNodesInfoKeysRule = {
  contract_address: 'string',
  chain_id: stringAllowEmptyType,
  api_ip: stringAllowEmptyType,
  api_domain: stringAllowEmptyType,
  rpc_ip: stringAllowEmptyType,
  rpc_domain: stringAllowEmptyType,
  token_name: stringAllowEmptyType,
  owner: stringAllowEmptyType,
  status: {
    type: 'int',
    required: false,
    allowEmpty: true
  }
};

const getInfoOptions = function(body) {
  const {
    contract_address,
    chain_id,
    api_ip = '',
    api_domain = '',
    rpc_ip = '',
    rpc_domain = '',
    token_name = '',
    owner = '',
    status
  } = body;
  const options = {
    contract_address,
    chain_id,
    api_ip,
    api_domain,
    rpc_ip,
    rpc_domain,
    token_name,
    owner,
    status: parseInt(status, 10)
  };
  // eslint-disable-next-line no-unused-vars
  for (const each in options) {
    if (typeof options[each] === 'string') {
      options[each] = options[each].trim();
    }
  }
  // check URL
  const httpURLList = [ 'api_ip', 'api_domain', 'rpc_ip', 'rpc_domain' ];
  httpURLList.forEach(item => {
    const value = options[item];
    if (!!value && !value.includes('http')) {
      throw Error(`${item}(${value}) is illegal. http://xxx is OK.`);
    }
  });

  return options;
};

class NodesController extends Controller {

  async getNodesInfo() {
    const { ctx } = this;
    try {
      // TODO: whitelist or API server must not open to Public.
      const result = await ctx.service.nodes.getNodesInfo();
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  /**
     * insert information of AElf Node.
     *
     * @API postNodesInfo
     * Param detail see postNodesInfoKeysRule.
     * @return {Object}
     */
  async postNodesInfo() {
    const { ctx } = this;
    try {
      const options = getInfoOptions(ctx.request.body);
      ctx.validate(postNodesInfoKeysRule, options);
      // TODO: 这个需要使用简单的账户系统了。Need Account system to manage.
      const result = await ctx.service.nodes.postNodesInfo(options);
      formatOutput(ctx, 'post', result);
      // formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  /**
     * update information of AElf Node.
     *
     * @API putNodesInfo
     * Param detail see putNodesInfoKeysRule.
     * @return {Object}
     */
  async putNodesInfo() {
    const { ctx } = this;
    try {
      const options = getInfoOptions(ctx.request.body);
      ctx.validate(putNodesInfoKeysRule, options);
      // TODO: 这个需要使用简单的账户系统了。Need Account system to manage.
      const result = await ctx.service.nodes.putNodesInfo(options);
      formatOutput(ctx, 'put', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
  // No delete but only change the status of nodes.
  // async deleteNodesInfo() {}
}

module.exports = NodesController;
