/**
 * @file get amount
 * @author atom-yang
 */
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
      let realParams;
      try {
        realParams = JSON.parse(params);
      } catch (e) {
        realParams = params;
      }
      const {
        symbol = 'ELF'
      } = realParams;
      item.decimals = tokenDecimals[symbol] || 8;
      item.symbol = symbol;
      return item;
    });
  }
}

module.exports = GetTransferAmountService;
