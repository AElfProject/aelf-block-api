/**
 * @file
 * @author huangzongzhe
 * 2018.08
 */
const BaseService = require('../core/baseService');

class AllService extends BaseService {

  async getAllBlocks(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const { limit, page, order } = options;
    const { redisKeys } = this.app.config;
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;
      const getBlocksSql = `select * from blocks_0 ORDER BY block_height ${order} limit ? offset ?`;
      const blocks = await this.selectQuery(aelf0, getBlocksSql, [ limit, offset ]);
      const blocksCount = await this.redisCommand('get', redisKeys.blocksCount) || 0;
      return {
        total: blocksCount,
        blocks
      };
    }
    return '傻逼，滚。';
  }

  async getAllTransactions(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const { redisKeys } = this.app.config;
    const { limit, page, order } = options;
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;
      const getTxsSql = `select * from transactions_0 ORDER BY block_height ${order} limit ? offset ? `;
      const txs = await this.selectQuery(aelf0, getTxsSql, [ limit, offset ]);
      const txsCount = await this.redisCommand('get', redisKeys.txsCount) || 0;
      return {
        total: txsCount,
        transactions: txs
      };
    }
    return '傻逼，滚。';
  }
}

module.exports = AllService;
