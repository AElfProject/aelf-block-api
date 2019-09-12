/**
 * @file block.js
 * @author huangzongzhe
 * 2018.08
 */
const BaseService = require('../core/baseService');

class BlockService extends BaseService {

  async getTransactions(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, order, block_hash
    } = options;
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;
      const getTxsSql
                = 'select * from transactions_0  where block_hash=?'
                + `ORDER BY block_height ${order} limit ? offset ? `;
      const getCountSql = 'select count(*) from transactions_0  where block_hash=?';
      // return sql;
      const txs = await this.selectQuery(aelf0, getTxsSql, [ block_hash, limit, offset ]);
      const count = await this.selectQuery(aelf0, getCountSql, [ block_hash ]);
      // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
      return {
        total: count[0].total,
        transactions: txs
      };
    }
    return '傻逼，滚。';
  }
}

module.exports = BlockService;
