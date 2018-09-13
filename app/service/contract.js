/*
 * huangzongzhe
 * 2018.08
 */
const Service = require('egg').Service;

class ContractService extends Service {
    
    async getDetail(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { contract_address } = options;
        
        let detailSql = `select * from contract_aelf20 where contract_address=?`;

        let detail = await aelf0.query(detailSql, [ contract_address ]);
        // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
        return detail;
    }
}

module.exports = ContractService;