/**
 * @file service/tps.js
 * @author huangzongzhe
 * 2018.11
 */
const axios = require('axios').default;
const BaseService = require('../core/baseService');

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

  async getAll() {
    try {
      const {
        sideChainAPI
      } = this.app.config;
      let otherList = await Promise.all(sideChainAPI.map(v => this.getTpsFromOther(v)));
      otherList = otherList.filter(other => other.length > 0);
      let ownList = await this.getTps();
      let { end } = ownList[ownList.length - 1];
      let { start } = ownList[0];
      const otherListStart = otherList.map(other => other[0].start);
      const otherListEnd = otherList.map(other => other[other.length - 1].end);
      end = Math.min(end, ...otherListEnd);
      start = Math.max(start, ...otherListStart);
      otherList = otherList.map(other => {
        return other.filter(v => v.end <= end && v.start >= start);
      });
      ownList = ownList.filter(v => v.end <= end && v.start >= start);
      const allList = ownList.map((d, index) => {
        const { count, start } = d;
        return {
          ...d,
          count: otherList.reduce((acc, v) => {
            const tpsItemMatched = v.find(item => item.start === start) || {count: 0};
            return acc + tpsItemMatched.count || 0;
          }, count)
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
