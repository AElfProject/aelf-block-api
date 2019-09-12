/**
 * @file block.js
 * @author huangzongzhe
 * 2018.08
 */
// const Service = require('egg').Service;
const BaseService = require('../core/baseService');

class BlockService extends BaseService {

  async getTransactions(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, block_hash
    } = options;
    const offset = limit * page;
    const getTxsSql
      = 'select * from transactions_0  where block_hash=?'
      + ' limit ? offset ? ';
    const getCountSql = 'select tx_count AS total from blocks_0  where block_hash=?';
    const txs = await this.selectQuery(aelf0, getTxsSql, [ block_hash, limit, offset ]);
    const count = +limit === 1 ? 1 : (await this.selectQuery(aelf0, getCountSql, [ block_hash ]))[0].total;
    return {
      total: count,
      transactions: txs
    };
  }
}

module.exports = BlockService;
