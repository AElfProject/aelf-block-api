/**
 * @file
 * @author huangzongzhe
 * 2018.08
 */
// const Service = require('egg').Service;
const BaseService = require('../core/baseService');
class AllService extends BaseService {

    async getAllBlocks(options) {

        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {limit, page, order} = options;
        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
            const offset = limit * page;
            // let getBlocksSql = `select SQL_CALC_FOUND_ROWS * from blocks_0 ORDER BY block_height ${order} limit ? offset ?`;
            let getBlocksSql = `select * from blocks_0 ORDER BY block_height ${order} limit ? offset ?`;
            // let getCountSql = `SELECT FOUND_ROWS()`;
            let getCountSql = 'select count(*) as total from blocks_0';
            // return sql;
            // aelf0.
            let blocks = await this.selectQuery(aelf0, getBlocksSql, [limit, offset]);
            // [] If default parameters are used in the query, empty arrays are passed
            let count = await this.selectQuery(aelf0, getCountSql, []);
            // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
            return {
                // total: count[0]["FOUND_ROWS()"],
                total: count[0].total,
                blocks: blocks
            };
        }
        return '傻逼，滚。';
    }

    async getAllTransactions(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {limit, page, order} = options;
        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
            const offset = limit * page;
            // let getTxsSql = `select SQL_CALC_FOUND_ROWS * from transactions_0 ORDER BY block_height ${order} limit ? offset ? `;
            let getTxsSql = `select * from transactions_0 ORDER BY block_height ${order} limit ? offset ? `;
            // let getCountSql = `SELECT FOUND_ROWS()`;
            let getCountSql = 'select count(*) as total from blocks_0';
            // return sql;
            let txs = await this.selectQuery(aelf0, getTxsSql, [limit, offset]);
            // [] If default parameters are used in the query, empty arrays are passed
            let count = await this.selectQuery(aelf0, getCountSql, []);
            // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
            return {
                total: count[0].total,
                transactions: txs
            };
        }
        return '傻逼，滚。';
    }
}

module.exports = AllService;