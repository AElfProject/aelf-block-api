const { Subscription } = require('egg');
const moment = require('moment');
const {
  getLocalTps
} = require('../utils/utils');

const TIME_RANGE = 3 * 60 * 60 * 1000; // ms
const TOTAL_LENGTH = TIME_RANGE / (60 * 1000) + 10;

class Tps extends Subscription {
  static get schedule() {
    return {
      cron: '0 */5 * * * *',
      type: 'worker',
      immediate: true
    };
  }

  async subscribe() {
    if (+process.env.ENABLE_TPS_QUERY !== 1) {
      return;
    }
    const { app } = this;
    const {
      tpsInterval,
      tpsListRedisKey
    } = app.config;
    const nowEndTime = Math.floor(moment().valueOf() / tpsInterval) * tpsInterval - tpsInterval * 2;
    const lastTps = await app.redis.lrange(tpsListRedisKey, -1, -1);
    let lastEndTime;
    if (lastTps.length === 0) {
      lastEndTime = nowEndTime - TIME_RANGE;
    } else {
      lastEndTime = JSON.parse(lastTps[0]).end;
    }
    if (nowEndTime - lastEndTime <= 0) {
      return;
    }
    const list = await getLocalTps(app.mysql.get('aelf0'), {
      start: lastEndTime,
      end: nowEndTime,
      interval: tpsInterval
    });
    await app.redis.rpush(tpsListRedisKey, ...(list.map(v => JSON.stringify(v))));
    const currentLength = await app.redis.llen(tpsListRedisKey);
    const diff = currentLength - TOTAL_LENGTH;
    if (diff > 0) {
      await app.redis.ltrim(tpsListRedisKey, diff, -1);
    }
  }
}

module.exports = Tps;
