/**
 * @file service/resource.js
 * @author huangzongzhe
 * 2019.02
 */
// const Service = require('egg').Service;
const moment = require('moment');
const BaseService = require('../core/baseService');

function formatTime(time) {
  return moment(time).utc().format();
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
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;

      const sqlValue = [ address, limit, offset ];

      const getTxsSql = `select * from resource_0
                            where address=? 
                            ORDER BY time ${order} limit ? offset ? `;
      const getCountSql = `select count(*) as total from resource_0
                            where address=?`;
      const txs = await this.selectQuery(aelf0, getTxsSql, sqlValue);
      const count = await this.selectQuery(aelf0, getCountSql, [ address ]);

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

    const sqlValue = [ type, limit ];

    const getBuySql
            = 'select * from resource_0 where type=? and method="Buy" order by time desc limit ? offset 0';
    const getSoldSql
            = 'select * from resource_0 where type=? and method="Sell" order by time desc limit ? offset 0';

    const buyRecords = await this.selectQuery(aelf0, getBuySql, sqlValue);
    const soldRecords = await this.selectQuery(aelf0, getSoldSql, sqlValue);

    return {
      buyRecords,
      soldRecords
    };
  }

  async getTurnover(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    let {
      interval,
      type,
      range = 20
    } = options;
    const minInterval = 5 * 60 * 1000; // ms
    interval = Math.max(minInterval, interval);
    const timeNow = Math.ceil(moment().valueOf() / interval) * interval;
    const timeNowUTC = formatTime(moment(timeNow));
    const startTime = moment(timeNow).subtract(interval * (range + 1), 'ms');
    const startTimeUTC = formatTime(startTime);
    const selectSql = 'select * from resource_0 where time between ? and ? and type=? and tx_status = ?';
    const resourceRecords = await this.selectQuery(aelf0, selectSql, [ startTimeUTC, timeNowUTC, type, 'Mined' ]);
    const timeList = new Array(range).fill(1).map((_, i) => {
      return {
        date: formatTime(moment(startTime).add(interval * i, 'ms')),
        count: 0
      };
    });

    const buyRecords = [ ...timeList ];
    const sellRecords = [ ...timeList ];
    resourceRecords.forEach(item => {
      const { time, method } = item;
      let index = Math.floor((moment(time).valueOf() - startTime) / interval);
      if (index === buyRecords.length) {
        index -= 1;
      }
      if (method === 'Buy') {
        buyRecords[index] = {
          ...buyRecords[index],
          count: item.elf + item.fee + buyRecords[index].count
        };
      } else {
        sellRecords[index] = {
          ...sellRecords[index],
          count: item.elf + item.fee + sellRecords[index].count
        };
      }
    });
    return {
      buyRecords,
      sellRecords
    };
  }
}

module.exports = ResourceService;
