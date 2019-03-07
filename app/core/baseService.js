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
        const rollbackCount = 60;
        const unConfirmedList = ['transactions', 'blocks', 'resources'];
        // demo: ['from  transactions_0 '], ['from  blocks_0 '], ['from resource_0 ']
        const matchUnconfirmedReg
            = new RegExp(`from\\s*(${unConfirmedList.join('|')})_\\d*\\s*`, 'g');
        const table = sql.match(matchUnconfirmedReg); // ["from  transactions_0 "];
        const tableUnconfirmed = table[0].replace(/_\d*/, '_unconfirmed');
        let unconfirmedSql = sql.replace(table[0], tableUnconfirmed);

        const blankList = sql.match(/\w*\s*\?\s*/g);
        let limitIndex = -1;
        let offsetIndex = -1;
        const blankListLenght = blankList.length;
        for (let i = 0; i < blankListLenght; i++) {
            if (blankList[i].includes('limit')) {
                limitIndex = i;
            }
            else if (blankList[i].includes('offset')) {
                offsetIndex = i;
            }
        }

        const offsetNum = sqlValues[offsetIndex]; // n
        const limitNum = sqlValues[limitIndex]; // m
        // 需要处理unconfirmed的逻辑
        if (table && table.length) {
            if (offsetNum > rollbackCount) {
                return await pool.query(sql, sqlValues);
            }
            // offsetNum belongs to [0, rollbackCount]
            if ((offsetNum + limitNum) <= rollbackCount) {
                return await pool.query(unconfirmedSql, sqlValues);
            }

            let sqlValuesUnconfirmed = Array.from(sqlValues);
            sqlValuesUnconfirmed[limitIndex] = rollbackCount - offsetNum;

            let sqlValuesConfirmed = Array.from(sqlValues);

            sqlValuesConfirmed[offsetIndex] = rollbackCount + 1;
            sqlValuesConfirmed[limitIndex] = offsetNum + limitNum - rollbackCount;

            // 如果是count的话，count相加。
            // 如果是分页的话，合并两个数组。
            if (sql.includes('limit') && sql.includes('offset')) {
                const partUnconfirmed = await pool.query(unconfirmedSql, sqlValuesUnconfirmed);
                const partConfirmed = await pool.query(sql, sqlValuesConfirmed);
                return [...partUnconfirmed, ...partConfirmed];
            }
            // count的计算是不精准的
            if (sql.includes('count(')) {
                unconfirmedSql
                    = unconfirmedSql.toLocaleLowerCase().replace(/count\(\*\)\s*as\s*total/, 'block_height')
                    + ` order by block_height limit ${rollbackCount} offset 0`;
                const partUnconfirmed = await pool.query(unconfirmedSql, sqlValuesUnconfirmed);
                const countUnconfirmed = partUnconfirmed.length;
                const sqlArray = sql.toLocaleLowerCase().split(/\s+/);
                const asKey = sqlArray[sqlArray.indexOf('as') + 1];

                let partConfirmed = await pool.query(sql, sqlValuesConfirmed);
                partConfirmed[0][asKey] += countUnconfirmed;
                return partConfirmed;
            }
        }
        return await pool.query(sql, sqlValues);
    }
}
module.exports = BaseService;
