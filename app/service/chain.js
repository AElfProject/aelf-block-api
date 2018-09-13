/*
 * huangzongzhe
 * 2018.08
 */
const Service = require('egg').Service;

class ChainService extends Service {

    async getBlocks(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { limit, page, order, chain_id } = options;
        if (['DESC', 'ASC', 'desc', 'asc'].indexOf(order) > 0) {
            const offset = limit * page;
            let getBlocksSql = `select SQL_CALC_FOUND_ROWS * from blocks_0 where chain_id=? ORDER BY block_height ${order} limit ? offset ?`;
            let getCountSql = `SELECT FOUND_ROWS()`;
            // return sql;
            let blocks = await aelf0.query(getBlocksSql, [chain_id, limit, offset]);
            let count = await aelf0.query(getCountSql);
            // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
            return {
                total: count[0]["FOUND_ROWS()"],
                blocks: blocks
            };
        }
        return '傻逼，滚。';
    }
    
    async getTransactions(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { limit, page, order, chain_id } = options;
        if (['DESC', 'ASC', 'desc', 'asc'].indexOf(order) > 0) {
            const offset = limit * page;
            let getTxsSql = `select SQL_CALC_FOUND_ROWS * from transactions_0  where chain_id=? ORDER BY block_height ${order} limit ? offset ? `;
            let getCountSql = `SELECT FOUND_ROWS()`;
            // return sql;
            let txs = await aelf0.query(getTxsSql, [chain_id, limit, offset]);
            let count = await aelf0.query(getCountSql);
            // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
            return {
                total: count[0]["FOUND_ROWS()"],
                transactions: txs
            };
        }
        return '傻逼，滚。';
    }
}

module.exports = ChainService;