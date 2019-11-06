const BaseService = require('../core/baseService');

class ChainService extends BaseService {

  async getBlocks(options) {
    const { redisKeys } = this.app.config;
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, order
    } = options;
    const offset = limit * page;
    const getBlocksSql = 'select * from blocks_0 ORDER BY block_height ? limit ? offset ?';
    const blocks = await this.selectQuery(aelf0, getBlocksSql, [ order, limit, offset ]);
    const blocksCount = await this.redisCommand('get', redisKeys.blocksCount) || 0;
    return {
      total: blocksCount,
      blocks
    };
  }

  async getTransactions(options) {
    const { redisKeys } = this.app.config;
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, order
    } = options;
    const offset = limit * page;
    // eslint-disable-next-line max-len
    const getTxsSql = 'select * from transactions_0 ORDER BY block_height ? limit ? offset ? ';
    const txs = await this.selectQuery(aelf0, getTxsSql, [ order, limit, offset ]);
    const txsCount = await this.redisCommand('get', redisKeys.txsCount) || 0;
    return {
      total: txsCount,
      transactions: txs
    };
  }
}

module.exports = ChainService;
