/**
 * @file service/api.js
 * @author huangzongzhe
 * 2018.08
 */
// const Service = require('egg').Service;
const BaseService = require('../core/baseService');
// 尽量不要直接使用使用sql来查询，如果非要使用的话，请用escape方法。
// This just uses connection.escape() underneath
// const postId = 1;
// const results = await this.app.mysql.query('update posts set hits = (hits + ?) where id = ?', [1, postId]);
// Not using the in-file interface
class ApiService extends BaseService {

  async transactions(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const { address, limit, page } = options;
    const sql = 'select * from transactions_0 where params_to = ? or address_from = ? limit  ? offset  ?';
    const offset = limit * page;
    const result = await this.selectQuery(
      aelf0,
      sql,
      [ address, address, limit, offset ]
    );
    return result;
  }

  async getAllBlocks(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const { limit, page, order } = options;
    const offset = limit * page;
    const sql = 'select * from blocks_0 ORDER BY block_height ? limit ? offset ?';
    const result = await this.selectQuery(aelf0, sql, [ order, limit, offset ]);
    return result;
  }
}

module.exports = ApiService;
