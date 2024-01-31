/**
 * @file service/tps.js
 * @author huangzongzhe
 * 2019.09
 */
const moment = require('moment');
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

      if (address && symbol) {
        getTxsIdSql = `select id from ${tableName}
        where (address_from=? or address_to=?) AND symbol=?
        ORDER BY id ${order} limit ? offset ?`;

        getTxsIdSqlParams = [ address, address, symbol, limit, offset ];
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

    const key = 'explore_api:price:' + fsym + tsyms;
    const keyPriceUpdateLock = 'explore_api:price:req_lock' + fsym + tsyms;

    const priceCache = await this.redisCommand('get', key);
    const priceUpdateLock = (await this.redisCommand('get', keyPriceUpdateLock)) === 'true';
    if (priceCache) {
      const {
        result,
        timestamp
      } = JSON.parse(priceCache);
      const priceExpire = parseInt(this.ctx.app.config.cache.priceExpire, 10);
      const isExpired = Date.now() - timestamp > priceExpire;
      if (!priceUpdateLock && isExpired) {
        await this.redisCommand('set', keyPriceUpdateLock, 'true', 'EX', 60);
        await this.getPriceFromThirdParty(options);
        await this.redisCommand('set', keyPriceUpdateLock, 'false');
      }
      console.log(
        'getPrice from cache; isExpired:', isExpired, (Date.now() - timestamp - priceExpire) / 1000, 's; '
        , 'locked: ', priceUpdateLock
      );
      return result;
    }
    console.log('getPrice directly');

    const result = await this.getPriceFromThirdParty(options);
    return result;
  }

  async getPriceFromThirdParty(options) {

    let result = await this.getPriceFromCryptoCompare(options);
    if (result.Response === 'Error') {
      result = await this.getPriceFromCoingecko(options);
    }

    return result;
  }

  async getPriceFromCryptoCompare(options) {
    const {
      fsym,
      tsyms
    } = options;

    const result = (await this.ctx.curl(
      `https://min-api.cryptocompare.com/data/price?fsym=${fsym}&tsyms=${tsyms}`, {
        dataType: 'json'
      }
    )).data;

    console.log('Price from Crypto Compare: ', result);
    if (result.Response === 'Error') {
      return result;
    }

    result.symbol = fsym;

    const priceCache = {
      result,
      timestamp: Date.now()
    };
    const key = 'explore_api:price:' + fsym + tsyms;

    await this.redisCommand('set', key, JSON.stringify(priceCache));

    return result;
  }

  async getPriceFromCoingecko(options) {
    const {
      fsym,
      tsyms
    } = options;

    // Todo: explorer v2 api, support a api to get this map.
    const idsMap = {
      ELF: 'aelf',
      USDT: 'tether',
      BTC: 'bitcoin',
      ETH: 'ethereum',
    };

    const tokenId = idsMap[fsym] || fsym;
    const result = (await this.ctx.curl(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${tsyms}`,
      {
        dataType: 'json',
      }
    )).data;

    console.log('Price from Coingecko: ', result);
    if (result.status && result.status.error_code) {
      return result;
    }

    result.symbol = fsym;
    const currenciesKeys = Object.keys(result[tokenId]);
    currenciesKeys.forEach(key => {
      result[key.toUpperCase()] = result[tokenId][key];
    });

    const priceCache = {
      result,
      timestamp: Date.now()
    };
    const key = 'explore_api:price:' + fsym + tsyms;

    await this.redisCommand('set', key, JSON.stringify(priceCache));

    return result;
  }

  async getPriceHistory(options) {
    const maxLength = this.ctx.app.config.cache.priceHistoryLength;
    const { date, token_id, vs_currencies } = options;
    const dateObj = moment(Number(date));
    const dateStr = dateObj.format('DD-MM-YYYY');
    const lowerCaseVsCurrencies = vs_currencies.split(',').map(token => token.toLowerCase());

    const key = `api/history-price-${token_id}`;
    const cacheRes = await this.redisCommand('get', key);
    const cacheData = JSON.parse(cacheRes);
    let result;

    if (cacheData) {
      const { [dateStr]: targetData = undefined } = Object.fromEntries(cacheData);
      result = targetData;
    }
    if (!result) {
      result = (await this.ctx.curl(
        `https://api.coingecko.com/api/v3/coins/${token_id}/history?date=${dateStr}`, {
          dataType: 'json'
        }
      )).data.market_data.current_price;
      const newCacheData = cacheData
        ? cacheData.slice(1 - maxLength)
        : [];

      this.redisCommand('set', key, JSON.stringify([ ...newCacheData, [ dateStr, result ]]));
    }
    const value = Object.entries(result)
      .filter(item => lowerCaseVsCurrencies.includes(item[0]));
    return Object.fromEntries(value);
  }

  // TODO: request all tokens info to cache, create your own price pool
  async getPrices(pairs) {
    return Promise.all(pairs.map(pair => {
      const { fsym, tsyms } = pair;
      const key = `api${fsym}${tsyms}`;
      if (cache.hasCache(key)) {
        return cache.getCache(key);
      }

      return this.ctx.curl(
        `https://min-api.cryptocompare.com/data/price?fsym=${fsym}&tsyms=${tsyms}`, {
          dataType: 'json'
        }
      ).then(data => {
        const resultTemp = data.data;
        resultTemp.symbol = fsym;
        cache.initCache(key, resultTemp, {
          expireTimeout: parseInt(this.ctx.app.config.cache.priceExpire, 10)
        });
        return resultTemp;
      });
    }));
  }

  async getTokenList(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit = 1000,
      page = 0,
    } = options;

    const offset = page * limit;
    const sql = 'select * from contract_aelf20 order by id desc limit ? offset ?';
    return this.selectQuery(aelf0, sql, [ limit, offset ]);
  }
}

module.exports = TokenService;
