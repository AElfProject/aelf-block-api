/**
 * @file service/api.js
 * @author huangzongzhe
 * 2018.08
 */
const Service = require('egg').Service;

// 尽量不要直接使用使用sql来查询，如果非要使用的话，请用escape方法。
// This just uses connection.escape() underneath
// const postId = 1;
// const results = await this.app.mysql.query('update posts set hits = (hits + ?) where id = ?', [1, postId]);
class ApiService extends Service {

    async transactions(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {address, limit, page} = options;

        const offset = limit * page;
        let result = await aelf0.query(
            'select * from transactions_0 where params_to = ? or address_from = ? limit  ? offset  ?',
            [address, address, limit, offset]
        );
        return result;
    }

    async getAllBlocks(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {limit, page, order} = options;
        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
            const offset = limit * page;
            let sql = `select * from blocks_0 ORDER BY block_height ${order} limit ? offset ?`;
            // return sql;
            let result = await aelf0.query(sql, [limit, offset]);
            // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
            return result;
        }
        return '傻逼，滚。';
    }
}

module.exports = ApiService;
