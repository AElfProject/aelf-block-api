/**
 * @deprecated
 * No service/controller/schedule use this service now
 * @file get amount
 * @author atom-yang
 */
const {
  Service
} = require('egg');

class GetTransferAmountService extends Service {
  async filter(list = []) {
    const tokenDecimals = await this.app.redis
      .get('aelf_chain_tokens')
      .then(res => JSON.parse(res || '{}'))
      .catch(() => {});
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
      item.decimals = tokenDecimals[symbol].symbol || 8;
      item.symbol = symbol;
      return item;
    });
  }
}

module.exports = GetTransferAmountService;
