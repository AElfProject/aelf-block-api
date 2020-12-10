const Decimal = require('decimal.js');
const { Subscription } = require('egg');
const AElf = require('aelf-sdk');
const {
  getContract
} = require('../utils/utils');

class Dividend extends Subscription {
  static get schedule() {
    return {
      cron: '0 */5 * * * *',
      type: 'worker',
      immediate: true
    };
  }

  async subscribe() {
    const { app } = this;
    const {
      endpoint
    } = app.config;
    const aelf0 = app.mysql.get('aelf0');
    const getDecimalSql
      = 'select symbol, decimals from contract_aelf20';
    const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
    const {
      ChainId
    } = await aelf.chain.getChainStatus();
    let dividends = {};
    if (ChainId === 'AELF') {
      const [
        treasury,
        consensus
      ] = await Promise.all([
        getContract(endpoint, 'AElf.ContractNames.Treasury'),
        getContract(endpoint, 'AElf.ContractNames.Consensus')
      ]);
      let undistributed = {
        value: {
          ELF: 0
        }
      };
      const miner = await consensus.GetCurrentTermMiningReward.call();
      try {
        undistributed = await treasury.GetUndistributedDividends.call();
      } catch (e) {
        console.log('call contract method failed');
      }
      if (undistributed && undistributed.value) {
        dividends.value = {
          ...(undistributed.value || {}),
          ELF: new Decimal((undistributed.value || {}).ELF || 0).add((miner && miner.value) ? miner.value : 0).toNumber()
        };
      }
    } else {
      const dividendContract = await getContract(endpoint, 'AElf.ContractNames.Consensus');
      dividends = await dividendContract.GetUndistributedDividends.call();
    }
    dividends = (dividends || {}).value || {};
    if (Object.keys(dividends).length > 0) {
      let decimals = await aelf0.query(getDecimalSql);
      decimals = (decimals || []).reduce((acc, v) => ({
        ...acc,
        [v.symbol]: v.decimals
      }), {});
      dividends = Object.keys(dividends).reduce((acc, key) => ({
        ...acc,
        [key]: new Decimal(dividends[key]).dividedBy(`1e${decimals[key] || 8}`).toNumber()
      }), {});
      await app.redis.set('aelf_chain_dividends', JSON.stringify(dividends));
    }
  }
}

module.exports = Dividend;
