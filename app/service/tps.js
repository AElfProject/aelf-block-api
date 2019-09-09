/**
 * @file service/tps.js
 * @author huangzongzhe
 * 2018.11
 */
const BaseService = require('../core/baseService');

class TpsService extends BaseService {
  async getTps(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      start_time,
      end_time,
      order
    } = options;

    if ([ 'DESC', 'ASC', 'desc', 'asc' ].indexOf(order) > -1) {

      const sqlValue = [ start_time, end_time ];
      const getTpsSql = `select * from tps_0 where start between ? and ? ORDER BY start ${order}`;
      const getCountSql = 'select count(*) from tps_0 where start between ? and ?';

      const tps = await this.selectQuery(aelf0, getTpsSql, sqlValue);
      const count = await this.selectQuery(aelf0, getCountSql, sqlValue);

      return {
        total: count[0]['count(*)'],
        tps
      };
    }
  }
}

module.exports = TpsService;
