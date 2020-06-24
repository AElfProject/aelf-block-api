const { Subscription } = require('egg');
const AElf = require('aelf-sdk');
const {
  getContract
} = require('../utils/utils');

class Dividend extends Subscription {
  static get schedule() {
    return {
      cron: '0 */20 * * * *',
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
    const name = ChainId === 'AELF' ? 'Treasury' : 'Consensus';
    const dividendContract = await getContract(endpoint, `AElf.ContractNames.${name}`);
    let dividends = await dividendContract.GetUndistributedDividends.call();
    dividends = (dividends || {}).value || {};
    if (Object.keys(dividends).length > 0) {
      let decimals = await aelf0.query(getDecimalSql);
      decimals = (decimals || []).reduce((acc, v) => ({
        ...acc,
        [v.symbol]: v.decimals
      }), {});
      dividends = Object.keys(dividends).reduce((acc, key) => ({
        [key]: +dividends[key] / `1e${decimals[key] || 8}`
      }), {});
      await app.redis.set('aelf_chain_dividends', JSON.stringify(dividends));
    }
  }
}

module.exports = Dividend;
