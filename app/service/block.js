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

  async getBlockInfo(height) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const getBlocksSql
      = 'select * from blocks_0  where block_height=?';
    const getUnconfirmedBlocksSql
      = 'select * from blocks_unconfirmed  where block_height=?';
    let block = await this.selectQuery(aelf0, getBlocksSql, [ height ]);
    if (block.length === 0) {
      block = await this.selectQuery(aelf0, getUnconfirmedBlocksSql, [ height ]);
    }
    return block.length === 0 ? {} : block[0];
  }

  async getTransactionInfo(txId) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const getTxSql
      = 'select * from transactions_0  where tx_id=?';
    const getUnconfirmedTxSql
      = 'select * from transactions_unconfirmed  where tx_id=?';
    let tx = await this.selectQuery(aelf0, getTxSql, [ txId ]);
    if (tx.length === 0) {
      tx = await this.selectQuery(aelf0, getUnconfirmedTxSql, [ txId ]);
    }
    return tx.length === 0 ? {} : tx[0];
  }
}

module.exports = BlockService;
