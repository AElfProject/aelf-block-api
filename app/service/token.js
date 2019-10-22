/**
 * @file service/tps.js
 * @author huangzongzhe
 * 2019.09
 */
const BaseService = require('../core/baseService');

const CacheService = require('../utils/cache');

const cache = new CacheService();

class TokenService extends BaseService {
  async getTxs(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      symbol,
      address,
      limit,
      page,
      order
    } = options;

    if ([ 'DESC', 'ASC', 'desc', 'asc' ].indexOf(order) > -1) {

      // TODO: 等数据量打了后再做分区
      const offset = page * limit;
      const getTxsSql = `select * from transactions_token 
        where (address_from=? or address_to=?) AND symbol=? 
        ORDER BY id ${order} limit ? offset ?`;
      const getCountSql = 'select count(1) as total from transactions_token where (address_from=? or address_to=?) AND symbol=? ';

      const txs = await this.selectQuery(aelf0, getTxsSql, [
        address, address, symbol, limit, offset
      ]);
      const count = await this.selectQuery(aelf0, getCountSql, [
        address, address, symbol
      ]);

      return {
        total: count[0].total,
        transactions: txs
      };
    }
  }

  async getPrice(options) {
    const {
      fsym,
      tsyms
    } = options;

    const key = 'api' + fsym + tsyms;

    if (cache.hasCache(key)) {
      return cache.getCache(key);
    }

    const result = (await this.ctx.curl(
      `https://min-api.cryptocompare.com/data/price?fsym=${fsym}&tsyms=${tsyms}`, {
        dataType: 'json'
      }
    )).data;

    cache.initCache(key, result, {
      expireTimeout: 300000
    });

    return result;
  }
}

module.exports = TokenService;
