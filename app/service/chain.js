/*
 * huangzongzhe
 * 2018.08
 */
// const Service = require('egg').Service;
const BaseService = require('../core/baseService');

class ChainService extends BaseService {

    async getBlocks(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { limit, page, order, chain_id } = options;
        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
            const offset = limit * page;
            let getBlocksSql = `select * from blocks_0 where chain_id=? ORDER BY block_height ${order} limit ? offset ?`;
            let getCountSql = `select count(*)c from blocks_0 where chain_id=?`;
            // return sql;
            let blocks = await this.selectQuery(aelf0, getBlocksSql, [chain_id, limit, offset]);
            let count = await this.selectQuery(aelf0, getCountSql, [chain_id]);
            // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
            return {
                total: count[0].total,
                blocks: blocks
            };
        }
        return '傻逼，滚。';
    }
    
    async getTransactions(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { limit, page, order, chain_id } = options;
        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
            const offset = limit * page;
            let getTxsSql = `select * from transactions_0  where chain_id=? ORDER BY block_height ${order} limit ? offset ? `;
            let getCountSql = `select count(*) as total from transactions_0  where chain_id=?`;
            // return sql;
            let txs = await this.selectQuery(aelf0, getTxsSql, [chain_id, limit, offset]);
            let count = await this.selectQuery(aelf0, getCountSql, [chain_id]);
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