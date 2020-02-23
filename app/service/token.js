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

      // TODO: 等数据量大了后再做分区
      const offset = page * limit;
      const tableName = type === 'unconfirmed' ? 'transactions_token_unconfirmed' : 'transactions_token';

      let getTxsIdSql = '';
      let txsIds = [];
      let txs = [];
      let getTxsIdSqlParams = [];

      if (address && symbol) {
        getTxsIdSql = `select id from ${tableName}
        where (address_from=? or address_to=?) AND symbol=?
        ORDER BY id ${order} limit ? offset ?`;

        getTxsIdSqlParams = [ address, address, symbol, limit, offset ];
      }
      if (address) {
        getTxsIdSql = `select id from ${tableName}
        where (address_from=? or address_to=?) ORDER BY id ${order} limit ? offset ?`;

        getTxsIdSqlParams = [ address, address, limit, offset ];
      }
      if (symbol) {
        getTxsIdSql = `select id from ${tableName}
        where symbol=? ORDER BY id ${order} limit ? offset ?`;

        getTxsIdSqlParams = [ symbol, limit, offset ];
      }

      txsIds = await this.selectQuery(aelf0, getTxsIdSql, getTxsIdSqlParams);

      if (txsIds.length > 0) {
        const getTxsSql = `SELECT * FROM ${tableName} WHERE id in (${new Array(txsIds.length).fill('?').join(',')}) ORDER BY id ${order}`;
        txs = await this.selectQuery(aelf0, getTxsSql, txsIds.map(v => v.id));
      }
      // TODO: count total?
      return {
        total: 0,
        count: txsIds.length,
        limit,
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
