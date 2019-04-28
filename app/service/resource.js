/**
 * @file service/resource.js
 * @author huangzongzhe
 * 2019.02
 */

/* eslint-disable fecs-camelcase */
// const Service = require('egg').Service;
const moment = require('moment');
const BaseService = require('../core/baseService');

function formateMysqlUnixtime(time) {
    const jsUnixTime = (new Date(time)).getTime();
    return parseInt(jsUnixTime.toString().slice(0, 10), 10);
}

class ResourceService extends BaseService {

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
            const getCountSql = `select count(*) as total from resource_0
                            where address=?`;
            let txs = await this.selectQuery(aelf0, getTxsSql, sqlValue);
            let count = await this.selectQuery(aelf0, getCountSql, [address]);

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
            = 'select * from resource_0 where type=? and method="Buy" order by time desc limit ? offset 0';
        const getSoldSql
            = 'select * from resource_0 where type=? and method="Sell" order by time desc limit ? offset 0';

        let buyRecords = await this.selectQuery(aelf0, getBuySql, sqlValue);
        let soldRecords = await this.selectQuery(aelf0, getSoldSql, sqlValue);

        return {
            buyRecords,
            soldRecords
        };
    }

    async getTurnover(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        let {
            interval,
            type
        } = options;
        // 多条sql UNION ALL
        // 5min    1day
        // 30min   6day
        // 1hour   12day
        // 4hour   48day
        // 1day    48 * 6
        // 5days     48 * 6 * 5
        // 1week   48 * 6 * 7
        // select 1549972000000 as date, count(*) from resource_0 where time between 1549972000000 and 1550472657000;
        // 按日计算
        // select from_unixtime(time, '%Y-%m-%d') as date, count(*) from resource_0 group by from_unixtime(time, '%Y-%m-%d');
        // 按周计算
        // select WEEK(from_unixtime(time)) as date, from_unixtime(time), count(*) from resource_0 group by WEEK(from_unixtime(time));
        // const basicInterval = 86400000; // 24 * 60 * 60 * 1000; 1 day
        // const basicDayInterval = 1;
        interval = Math.max(300000, interval);
        const dayInterval = Math.ceil(interval / 300000); // Math.ceil(interval / 5min * 1day)
        const timeNow = moment().valueOf();

        let startTime = moment().subtract(dayInterval, 'day').startOf('day').valueOf(); // start time
        let selectSql = `select ${startTime} as date, count(*) as count from resource_0 `
            + ` where time between ${startTime} and ${startTime + interval - 1} `
            + 'and type=? and method=?';
        startTime += interval;
        let buyValueArray = [];
        let sellValueArray = [];
        buyValueArray.push(type, 'Buy');
        sellValueArray.push(type, 'Sell');

        while (startTime < timeNow) {
            selectSql += ' UNION ALL ' + `select ${startTime} as date, count(*) as count from resource_0 `
                + ` where time between ${startTime} and ${startTime + interval - 1} `
                + 'and type=? and method=?';
            startTime += interval;
            buyValueArray.push(type, 'Buy');
            sellValueArray.push(type, 'Sell');
        }

        const buyRecords = await this.selectQuery(aelf0, selectSql, buyValueArray);
        const sellRecords = await this.selectQuery(aelf0, selectSql, sellValueArray);

        return {
            buyRecords,
            sellRecords
        };
    }
}

module.exports = ResourceService;
