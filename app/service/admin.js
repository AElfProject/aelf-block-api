/**
 * @file service/address.js
 * @author huangzongzhe
 * 2019.07
 */
const BaseService = require('../core/baseService');

class AdminService extends BaseService {

  async login(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      name,
      pass
    } = options;

    const getUserSql = 'select * from user where address=? and password=?';
    const userInfo = await aelf0.query(getUserSql, [ name, pass ]);
    if (userInfo.length <= 0) {
      throw Error('What\'s your problem');
    }
    return userInfo;
  }
}

module.exports = AdminService;
