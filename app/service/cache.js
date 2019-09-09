/**
 * @file cache service
 * @author atom-yang
 * @date 2019.09.09
 */
const BaseService = require('../core/baseService');

class CacheService extends BaseService {

  async getTxsCount() {
    const { redisKeys } = this.app.config;
    const txsCount = await this.redisCommand('get', redisKeys.txsCount) || 0;
    const unconfirmedTxsCount = await this.redisCommand('get', redisKeys.txsUnconfirmedCount) || 0;
    return {
      txsCount,
      unconfirmedTxsCount
    };
  }
}

module.exports = CacheService;
