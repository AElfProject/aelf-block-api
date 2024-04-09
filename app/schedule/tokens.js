const { Subscription } = require('egg');

class Dividend extends Subscription {
  static get schedule() {
    return {
      cron: '0 */30 * * * *',
      type: 'worker',
      immediate: true
    };
  }

  async subscribe() {
    if (+process.env.ENABLE_TOKEN_SCHEDULE !== 1) {
      return;
    }
    const {
      app
    } = this;
    const aelf0 = app.mysql.get('aelf0');
    const sql = 'select symbol, decimals,total_supply from contract_aelf20';
    const result = await aelf0.query(sql);
    const tokens = result.reduce((acc, v) => ({
      ...acc,
      [v.symbol]: {
        decimals: v.decimals,
        totalSupply: v.total_supply
      }
    }), {});
    await app.redis.set('aelf_chain_tokens', JSON.stringify(tokens));
  }
}

module.exports = Dividend;
