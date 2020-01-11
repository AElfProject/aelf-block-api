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
      order,
      type
    } = options;

    if ([ 'DESC', 'ASC', 'desc', 'asc' ].indexOf(order) > -1) {

      // TODO: 等数据量打了后再做分区
      const offset = page * limit;

      const tableName = type === 'unconfirmed' ? 'transactions_token_unconfirmed' : 'transactions_token';

      const getTxsIdSql = `select id from ${tableName}
        where (address_from=? or address_to=?) AND symbol=?
        ORDER BY id ${order} limit ? offset ?`;

      const getAddressFromCountSql = `select count(1) as total from ${tableName} where address_from=? AND symbol=?`;
      const getAddressToCountSql = `select count(1) as total from ${tableName} where address_to=? AND symbol=?`;

      const addressFromCount = await this.selectQuery(aelf0, getAddressFromCountSql, [
        address, symbol
      ]);
      const addressToCount = await this.selectQuery(aelf0, getAddressToCountSql, [
        address, symbol
      ]);

      const txsIds = await this.selectQuery(aelf0, getTxsIdSql, [
        address, address, symbol, limit, offset
      ]);

      let txs = [];
      if (txsIds.length > 0) {
        const getTxsSql = `SELECT * FROM ${tableName} WHERE id in (${new Array(txsIds.length).fill('?').join(',')}) ORDER BY id ${order}`;
        txs = await this.selectQuery(aelf0, getTxsSql, txsIds.map(v => v.id));
      }

      return {
        total: addressFromCount[0].total + addressToCount[0].total,
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
