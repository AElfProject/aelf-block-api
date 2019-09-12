/**
 * @file cache service
 * @author atom-yang
 */
const Scheduler = require('./scheduler');

const defaultCacheConfig = {
  expireTimeout: 120000, // ms
};

class CacheService {

  constructor() {
    this.cacheList = new Map();
  }

  getCacheList() {
    return this.cacheList;
  }

  initCache(key, value, config = defaultCacheConfig) {
    const mergedConfig = {
      ...defaultCacheConfig,
      ...config
    };
    const scheduler = new Scheduler({
      interval: mergedConfig.expireTimeout
    });
    scheduler.setCallback(() => {
      this.removeCache(key);
    });
    scheduler.startTimer();
    this.cacheList.set(key, {
      value,
      expired: false,
      config: mergedConfig,
      scheduler,
    });
  }

  hasCache(key) {
    return this.cacheList.has(key);
  }

  getCache(key) {
    const result = this.cacheList.get(key) || {};
    if (result.expired) {
      return null;
    }
    if (result.value === null || result.value === undefined) {
      return null;
    }
    return result.value;
  }

  setCache(key, value) {
    const originVal = this.cacheList.get(key);
    this.cacheList.set(key, {
      ...originVal,
      value
    });
  }

  resetCache(key, value = '', option = {}) {
    const originVal = this.cacheList.get(key);
    const config = {
      ...originVal.config,
      ...option
    };
    originVal.scheduler.restartTimer({
      interval: config.expireTimeout
    });
    this.cacheList.set(key, {
      ...originVal,
      value,
      config,
      expired: false
    });
  }

  removeCache(key) {
    const originVal = this.cacheList.get(key);
    originVal.scheduler.endTimer();
    this.cacheList.delete(key);
  }
}

module.exports = CacheService;
