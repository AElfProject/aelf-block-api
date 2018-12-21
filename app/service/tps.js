/**
 * @file service/tps.js
 * @author huangzongzhe
 * 2018.11
 */
const Service = require('egg').Service;

class TpsService extends Service {
    async getTps(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        let {start_time, end_time, order} = options;

        if (['DESC', 'ASC', 'desc', 'asc'].indexOf(order) > -1) {

            const sqlValue = [start_time, end_time];
            const getTpsSql = `select * from tps_0 where start between ? and ? ORDER BY start ${order}`;
            const getCountSql = 'select count(*) from tps_0 where start between ? and ?';

            const tps = await aelf0.query(getTpsSql, sqlValue);
            const count = await aelf0.query(getCountSql, sqlValue);

            return {
                total: count[0]['count(*)'],
                tps: tps
            };
        }
        return '傻逼，滚。';
    }
}

module.exports = TpsService;
