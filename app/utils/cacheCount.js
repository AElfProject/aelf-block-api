/**
 * @file cache count
 * @author atom-yang
 */

const CacheService = require('./cache');

const countCache = new CacheService();

function timeout(time, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, time);
  });
}

function getOrSetCountCache(
  key,
  {
    func,
    args
  },
  timeCeil,
  expireTimeout = 600000
) {
  const cacheValue = countCache.getCache(key);
  if (cacheValue) {
    return cacheValue;
  }
  const now = new Date().getTime();
  return func(...args).then(res => {
    const hasOverflowTimeCeil = (new Date().getTime() - now) > timeCeil;
    if (hasOverflowTimeCeil) {
      if (countCache.hasCache(key)) {
        countCache.resetCache(key, res, {
          expireTimeout
        });
      } else {
        countCache.initCache(key, res, {
          expireTimeout
        });
      }
    }
    return res;
  });
}

module.exports = {
  getOrSetCountCache,
  timeout
};
