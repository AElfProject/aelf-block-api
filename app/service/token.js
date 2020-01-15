/**
 * @file service/tps.js
 * @author huangzongzhe
 * 2019.09
 */
const BaseService = require('../core/baseService');

const CacheService = require('../utils/cache');

const cache = new CacheService();

const {
  getOrSetCountCache,
  timeout
} = require('../utils/cacheCount');

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

      const countSqlValue = [
        address, symbol
      ];

      const results = await Promise.all([
        getAddressFromCountSql,
        getAddressToCountSql
      ].map((v, index) => {
        const cacheKey = `getTxs_${address}_${index}`;
        return Promise.race([
          getOrSetCountCache(cacheKey, {
            func: this.selectQuery,
            args: [ aelf0, v, countSqlValue ]
          }, 3000),
          timeout(3000, [{
            total: 100000
          }])
        ]).then(result => {
          if (result[0].total) {
            return result[0].total;
          }
          return 0;
        });
      }));

      const total = results.reduce((acc, v) => acc + parseInt(v, 10), 0);
      if (total === 0) {
        return {
          total: 0,
          transactions: []
        };
      }

      const txsIds = await this.selectQuery(aelf0, getTxsIdSql, [
        address, address, symbol, limit, offset
      ]);

      let txs = [];
      if (txsIds.length > 0) {
        const getTxsSql = `SELECT * FROM ${tableName} WHERE id in (${new Array(txsIds.length).fill('?').join(',')}) ORDER BY id ${order}`;
        txs = await this.selectQuery(aelf0, getTxsSql, txsIds.map(v => v.id));
      }

      return {
        total,
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
