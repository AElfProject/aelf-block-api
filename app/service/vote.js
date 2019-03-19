/**
 * @file service/vote.js
 * @author huangzongzhe
 * 2019.01
 */

/* eslint-disable fecs-camelcase */
const BaseService = require('../core/baseService');
class VoteService extends BaseService {

    async getRecord(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {
            limit,
            page,
            order,
            address,
            type
        } = options;
        // if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
        //     const offset = limit * page;

        //     let contractMatchSql = '';
        //     let sqlValue = [address, address, limit, offset];
        //     if (contract_address) {
        //         contractMatchSql = ' and address_to=? ';
        //         sqlValue = [address, address, contract_address, limit, offset];
        //     }

        //     const getTxsSql = `select * from transactions_0  
        //                     where (address_from=? or params_to=?) ${contractMatchSql} 
        //                     ORDER BY block_height ${order} limit ? offset ? `;
        //     const getCountSql = `select count(*) AS total from transactions_0  
        //                     where (address_from=? or params_to=?) ${contractMatchSql}`;

        //     let txs = await aelf0.query(getTxsSql, sqlValue);
        //     let count = await aelf0.query(getCountSql, [address, address, contract_address]);

        //     return {
        //         total: count[0].total,
        //         transactions: txs
        //     };
        // }

        return '傻逼，滚。';
    }

}

module.exports = VoteService;
