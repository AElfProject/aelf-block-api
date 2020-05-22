/**
 * @file service/resource.js
 * @author huangzongzhe
 * 2019.02
 */
const Decimal = require('decimal.js');
const moment = require('moment');
const BaseService = require('../core/baseService');

function formatTime(time) {
  return moment(time).utc().format();
}

const INTERVAL_MAP = {
  '5m': 5 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000
};

function formatTimeWithMinute(interval, chainStartTime, maxLen) {
  const now = moment();
  const end = Math.ceil(now.valueOf() / interval) * interval;
  const start = end - interval * maxLen;
  const diff = chainStartTime.valueOf() - start;
  if (diff <= 0) {
    return {
      start: moment(start),
      end: moment(end)
    };
  }
  return {
    end: moment(end),
    start: moment(Math.floor(chainStartTime.valueOf() / interval) * interval)
  };
}

const INTERVAL_FORMATTERS = {
  // 5min
  [INTERVAL_MAP['5m']]: {
    getTimeRange(chainStartTime, maxLen = 100) {
      return formatTimeWithMinute(INTERVAL_MAP['5m'], chainStartTime, maxLen);
    }
  },
  // 30min
  [INTERVAL_MAP['30m']]: {
    getTimeRange(chainStartTime, maxLen = 100) {
      return formatTimeWithMinute(INTERVAL_MAP['30m'], chainStartTime, maxLen);
    }
  },
  // 1h
  [INTERVAL_MAP['1h']]: {
    getTimeRange(chainStartTime, maxLen = 100) {
      return formatTimeWithMinute(INTERVAL_MAP['1h'], chainStartTime, maxLen);
    }
  },
  // 4h
  [INTERVAL_MAP['4h']]: {
    getTimeRange(chainStartTime, maxLen = 100) {
      return formatTimeWithMinute(INTERVAL_MAP['4h'], chainStartTime, maxLen);
    }
  },
  // 1d
  [INTERVAL_MAP['1d']]: {
    getTimeRange(chainStartTime, maxLen = 100, timeZone) {
      const timeOffset = timeZone * -60;
      const {
        start,
        end
      } = formatTimeWithMinute(INTERVAL_MAP['1d'], chainStartTime, maxLen);
      return {
        start: start.add(timeOffset, 'm'),
        end: end.add(timeOffset, 'm')
      };
    }
  },
  // 1w
  [INTERVAL_MAP['1w']]: {
    getTimeRange(chainStartTime, maxLen = 100, timeZone) {
      const interval = INTERVAL_MAP['1w'];
      const end = moment().utcOffset(timeZone).endOf('week');
      const start = end.valueOf() - interval * maxLen;
      const diff = chainStartTime.valueOf() - start;
      if (diff <= 0) {
        return {
          start: moment(start),
          end: moment(end)
        };
      }
      return {
        end: moment(end),
        start: chainStartTime.utcOffset(timeZone).startOf('week')
      };
    }
  }
};

function calculatePrice(resource, elf) {
  return new Decimal(elf)
    .dividedBy(resource)
    .toDecimalPlaces(4, Decimal.ROUND_UP);
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
      const getCountSql = `select count(1) as total from resource_0
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
    const {
      app
    } = this;
    const aelf0 = app.mysql.get('aelf0');
    const {
      chainStartTime
    } = app.config;
    const decimals = 8;
    const {
      interval,
      timeZone = 8,
      type,
      range = 20
    } = options;
    const {
      start,
      end
    } = INTERVAL_FORMATTERS[interval].getTimeRange(moment(chainStartTime), range, timeZone);
    const selectSql = 'select resource, elf, time from resource_0 where time between ? and ? and type=? and tx_status = ?';
    const resourceRecords = await this.selectQuery(aelf0, selectSql, [
      formatTime(start),
      formatTime(end),
      type,
      'Mined'
    ]);
    // eslint-disable-next-line max-len
    const queryPriceSql = 'select resource, elf, time from resource_0 where time < ? and type=? and tx_status = ? order by time desc limit 1';
    const priceBefore = await this.selectQuery(aelf0, queryPriceSql, [
      formatTime(start),
      type,
      'Mined'
    ]);
    let initialPrice = priceBefore.length === 0 ? 0.02 : calculatePrice(priceBefore[0].resource, priceBefore[0].elf);
    const limitedRange = Math.ceil((end.valueOf() - start.valueOf()) / interval);
    const timeList = new Array(limitedRange).fill(1).map((_, i) => {
      return {
        date: formatTime(moment(start).add(interval * (i + 1), 'ms')),
        list: []
      };
    });
    resourceRecords.forEach(item => {
      const {
        time
      } = item;
      // 左闭右开区间
      const index = Math.floor((moment(time).valueOf() - start.valueOf()) / interval);
      if (index !== resourceRecords.length) {
        timeList[index] = {
          ...timeList[index],
          list: [ ...timeList[index].list, item ]
        };
      }
    });
    return timeList.map(item => {
      const {
        date,
        list
      } = item;
      let volume = list.reduce((acc, v) => acc + v.resource || 0, 0);
      volume = new Decimal(volume).dividedBy(`1e${decimals}`).toDecimalPlaces(4, Decimal.ROUND_UP);
      let prices = [];
      if (list.length === 0) {
        prices = [ initialPrice ];
      } else {
        prices = list.map(v => calculatePrice(v.resource, v.elf));
        initialPrice = prices[prices.length - 1];
      }
      return {
        date,
        volume,
        prices
      };
    });
  }
}

module.exports = ResourceService;
