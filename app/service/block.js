/**
 * @file block.js
 * @author huangzongzhe
 * 2018.08
 */
// const Service = require('egg').Service;
const BaseService = require('../core/baseService');

class BlockService extends BaseService {

  async getTransactions(options) {
    const {
      limit, page, block_hash
    } = options;
    const offset = limit * page;

    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const getTxsSql
      = 'select * from transactions_0  where block_hash=?'
      + ' limit ? offset ? ';
    const getUnconfirmedTxsSql
      = 'select * from transactions_unconfirmed  where block_hash=?'
      + ' limit ? offset ? ';
    let txs = await this.selectQuery(aelf0, getTxsSql, [ block_hash, limit, offset ]);
    if (txs.length === 0) {
      txs = await this.selectQuery(aelf0, getUnconfirmedTxsSql, [ block_hash, limit, offset ]);
    }
    return {
      transactions: txs
    };
  }
}

module.exports = BlockService;
