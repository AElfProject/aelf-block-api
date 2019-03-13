/**
 * @file baseService.js
 * @author huangzongzhe
 */
const {
    Service
} = require('egg');

class BaseService extends Service {
    // demo
    // get user() {
    //     return this.ctx.session.user;
    // }

    // Only support 单表查询
    // 1. select * from xxx order by xxx desc/asc limit n offset m;
    // 2. select count(*) as xx from xxx;
    async selectQuery(pool, sql, sqlValues) {
        // TODO: move to config / redis / db

        // select count(*)
        // select count(*) from transactions_unconfirmed where address_to='3AhZRe8RvTiZUBdcqCsv37K46bMU2L2hH81JF8jKAnAUup9'
        //  and params_to='3L8EHf4CMq2CHr9ifrmhNYf5hDH1DET1LNZKwzhJr8hFa2H'
        // UNION select count(*) from transactions_0 where address_to='3AhZRe8RvTiZUBdcqCsv37K46bMU2L2hH81JF8jKAnAUup9'
        //  and params_to='3L8EHf4CMq2CHr9ifrmhNYf5hDH1DET1LNZKwzhJr8hFa2H';

        // pagination
        // select * from transactions_unconfirmed where address_to = '3AhZRe8RvTiZUBdcqCsv37K46bMU2L2hH81JF8jKAnAUup9'
        // and params_to = '3L8EHf4CMq2CHr9ifrmhNYf5hDH1DET1LNZKwzhJr8hFa2H'
        // UNION select * from transactions_0 where address_to = '3AhZRe8RvTiZUBdcqCsv37K46bMU2L2hH81JF8jKAnAUup9'
        // and params_to = '3L8EHf4CMq2CHr9ifrmhNYf5hDH1DET1LNZKwzhJr8hFa2H'
        // order by block_height desc limit 10 offset 0;

        const secondPartList = ['transactions', 'blocks', 'resources'];
        const tableSuffix = '_unconfirmed';
        // demo: ['from  transactions_0 '], ['from  blocks_0 '], ['from resource_0 ']
        const matchUnconfirmedReg
            = new RegExp(`from\\s*(${secondPartList.join('|')})_\\d*\\s*`, 'g');
        const table = sql.match(matchUnconfirmedReg); // ["from  transactions_0 "];

        // 需要处理unconfirmed的逻辑
        if (table && table.length) {
            const tableUnconfirmed = table[0].replace(/_\d*/, tableSuffix);
            let unconfirmedSql = sql.replace(table[0], tableUnconfirmed);
            const orderString = unconfirmedSql.toLocaleLowerCase().match(/order.*/g, '') || [''];
            unconfirmedSql = unconfirmedSql.toLocaleLowerCase().replace(/order.*/g, '');

            const paramsArray = orderString[0].match(/\?/g) || [];
            const lengthRemove = paramsArray.length;
            let valueTemp = Array.from(sqlValues);
            valueTemp.length = valueTemp.length - lengthRemove;

            const finalSql = unconfirmedSql + ' UNION ' + sql;
            const result = await pool.query(finalSql, [...valueTemp, ...sqlValues]);
            if (sql.includes('count(')) {
                const sqlArray = sql.toLocaleLowerCase().split(/\s+/);
                const asKey = sqlArray[sqlArray.indexOf('as') + 1];

                const output = result[0][asKey] + result[1][asKey];
                return [{
                    [asKey]: output
                }];
            }

            return result;
        }
        return await pool.query(sql, sqlValues);
    }
}
module.exports = BaseService;
