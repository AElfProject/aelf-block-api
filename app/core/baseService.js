/**
 * @file baseService.js
 * @author huangzongzhe
 */
const {
  Service
} = require('egg');

class BaseService extends Service {
  async selectQuery(pool, sql, sqlValues) {
    const result = await pool.query(sql, sqlValues);
    return result;
  }

  async redisCommand(command, ...args) {
    const result = await this.app.redis[command](...args);
    return result;
  }
}
module.exports = BaseService;
