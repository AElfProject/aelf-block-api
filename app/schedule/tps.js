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
    const { app } = this;
    let {
      lastTpsStartTime,
      tpsInterval,
      tpsListRedisKey
    } = app.config;
    const nowEndTime = Math.floor(moment().valueOf() / tpsInterval) * tpsInterval - tpsInterval * 2;
    if (!lastTpsStartTime) {
      lastTpsStartTime = nowEndTime - TIME_RANGE;
    }
    if (nowEndTime - lastTpsStartTime <= 0) {
      return;
    }
    const list = await getLocalTps(app.mysql.get('aelf0'), {
      start: lastTpsStartTime,
      end: nowEndTime,
      interval: tpsInterval
    });
    await app.redis.rpush.call(app.redis, [ tpsListRedisKey, ...(list.map(v => JSON.stringify(v))) ]);
    const currentLength = await app.redis.llen(tpsListRedisKey);
    const diff = currentLength - TOTAL_LENGTH;
    if (diff > 0) {
      await app.redis.ltrim(tpsListRedisKey, diff, -1);
    }
  }
}

module.exports = Tps;
