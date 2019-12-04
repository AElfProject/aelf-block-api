/**
 * @file get amount
 * @author atom-yang
 */
const BigNumber = require('bignumber.js');
const {
  Service
} = require('egg');

class GetTransferAmountService extends Service {
  filter(list = []) {
    const { common } = this.app.cache;
    const tokenDecimals = common.getCache('tokenDecimals');
    return list.map(item => {
      const { quantity, params } = item;
      if (quantity <= 0) {
        return item;
      }
      const amount = new BigNumber(quantity);
      let realParams;
      try {
        realParams = JSON.parse(params);
      } catch (e) {
        realParams = params;
      }
      const {
        symbol = 'ELF'
      } = realParams;
      const decimals = tokenDecimals[symbol] || 8;
      item.amount = amount.dividedBy(new BigNumber(`10e${decimals}`)).toFixed(2);
      return item;
    });
  }
}

module.exports = GetTransferAmountService;
