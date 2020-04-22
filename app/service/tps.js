/**
 * @file service/tps.js
 * @author huangzongzhe
 * 2018.11
 */
const axios = require('axios').default;
const BaseService = require('../core/baseService');
const {
  formatTimeRange
} = require('../utils/utils');

class TpsService extends BaseService {
  async getTps() {
    const {
      app
    } = this;
    const {
      tpsListRedisKey
    } = app.config;
    let list = await app.redis.lrange(tpsListRedisKey, 0, -1);
    list = list.map(v => JSON.parse(v));
    return list;
  }

  async getTpsFromOther(url) {
    try {
      const response = await axios.get(`${url}/api/tps/list`);
      const {
        data,
      } = response;
      const {
        list = []
      } = data;
      return list;
    } catch (e) {
      return [];
    }
  }

  async getAll(options) {
    try {
      const {
        sideChainAPI
      } = this.app.config;
      const {
        start: paramsStart,
        end: paramsEnd
      } = formatTimeRange(options.start, options.end, options.interval);
      let otherList = await Promise.all(sideChainAPI.map(v => this.getTpsFromOther(v)));
      let ownList = await this.getTps();
      let { end } = ownList[ownList.length - 1];
      let { start } = ownList[0];
      end = Math.min(end, paramsEnd);
      start = Math.max(start, paramsStart);
      otherList = otherList.map(other => {
        return other.filter(v => v.end <= end && v.start >= start);
      });
      ownList = ownList.filter(v => v.end <= end && v.start >= start);
      const allList = ownList.map((d, index) => {
        const { count } = d;
        return {
          ...d,
          count: otherList.reduce((acc, v) => acc + v[index].count || 0, count)
        };
      });
      return {
        all: allList,
        own: ownList
      };
    } catch (e) {
      return {
        all: [],
        own: []
      };
    }
  }
}

module.exports = TpsService;
