/**
 * @file service/resource.js
 * @author huangzongzhe
 * 2019.02
 */

/* eslint-disable fecs-camelcase */
const Service = require('egg').Service;

class ResourceService extends Service {

    async getRecords(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {
            limit,
            page,
            order,
            address
        } = options;
        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
            const offset = limit * page;

            let sqlValue = [address, limit, offset];

            const getTxsSql = `select * from resource_0
                            where address=? 
                            ORDER BY time ${order} limit ? offset ? `;
            const getCountSql = `select count(*) AS total from resource_0
                            where address=?`;
            let txs = await aelf0.query(getTxsSql, sqlValue);
            let count = await aelf0.query(getCountSql, [address]);

            return {
                total: count[0].total,
                records: txs
            };
        }
        return '';
    }

    async getRealtimeRecords(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {
            limit,
            type
        } = options;

        let sqlValue = [type, limit];

        const getBuySql
            = 'select * from resource_0 where type=? and method="BuyResource" order by time desc limit ? offset 0';
        const getSoldSql
            = 'select * from resource_0 where type=? and method="SellResource" order by time desc limit ? offset 0';

        let buyRecords = await aelf0.query(getBuySql, sqlValue);
        let soldRecords = await aelf0.query(getSoldSql, sqlValue);

        return {
            buyRecords,
            soldRecords
        };
    }

    async getTurnover(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        let {
            interval,
            limit,
            page,
            order
        } = options;

        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
            const offset = limit * page;
            const selectSql
                = 'select count(*) as count, time from resource_0 group by time DIV ? order by time limit ? offset ?';
            const result = await aelf0.query(selectSql, [interval, limit, offset]);

            return result;
        }
        return '';
    }
}

module.exports = ResourceService;
