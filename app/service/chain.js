const BaseService = require('../core/baseService');

class ChainService extends BaseService {

  async getBlocks(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, order, chain_id
    } = options;
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;
      const getBlocksSql = `select * from blocks_0 where chain_id=? ORDER BY block_height ${order} limit ? offset ?`;
      const getCountSql = 'select count(*) from blocks_0 where chain_id=?';
      // return sql;
      const blocks = await this.selectQuery(aelf0, getBlocksSql, [ chain_id, limit, offset ]);
      const count = await this.selectQuery(aelf0, getCountSql, [ chain_id ]);
      // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
      return {
        total: count[0].total,
        blocks
      };
    }
    return '傻逼，滚。';
  }

  async getTransactions(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, order, chain_id
    } = options;
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;
      // eslint-disable-next-line max-len
      const getTxsSql = `select * from transactions_0  where chain_id=? ORDER BY block_height ${order} limit ? offset ? `;
      const getCountSql = 'select count(*) as total from transactions_0  where chain_id=?';
      // return sql;
      const txs = await this.selectQuery(aelf0, getTxsSql, [ chain_id, limit, offset ]);
      const count = await this.selectQuery(aelf0, getCountSql, [ chain_id ]);
      // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
      return {
        total: count[0].total,
        transactions: txs
      };
    }
    return '傻逼，滚。';
  }
}

module.exports = ChainService;
