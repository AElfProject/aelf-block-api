/**
 * @file cache count
 * @author atom-yang
 */

const CacheService = require('./cache');

const countCache = new CacheService();

function getOrSetCountCache(
  key,
  {
    func,
    args
  },
  expireTimeout = 600000
) {
  const cacheValue = countCache.getCache(key);
  if (cacheValue) {
    return cacheValue;
  }
  return func(...args).then(res => {
    if (countCache.hasCache(key)) {
      countCache.resetCache(key, res, {
        expireTimeout
      });
    } else {
      countCache.initCache(key, res, {
        expireTimeout
      });
    }
  });
}

module.exports = {
  getOrSetCountCache
};
