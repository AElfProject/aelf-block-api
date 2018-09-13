/*
 * huangzongzhe
 * 2018.08
 */
const Service = require('egg').Service;

class AddressService extends Service {
    
    async getTransactions(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { limit, page, order, address } = options;
        if (['DESC', 'ASC', 'desc', 'asc'].indexOf(order) > 0) {
            const offset = limit * page;
            let getTxsSql = `select SQL_CALC_FOUND_ROWS * from transactions_0  where address_from=? or params_to=? ORDER BY block_height ${order} limit ? offset ? `;
            let getCountSql = `SELECT FOUND_ROWS()`;
            // return sql;
            let txs = await aelf0.query(getTxsSql, [address, address, limit, offset]);
            let count = await aelf0.query(getCountSql);
            // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
            return {
                total: count[0]["FOUND_ROWS()"],
                transactions: txs
            };
        }
        return '傻逼，滚。';
    }

    async getBalance(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { address, contract_address } = options;
        // Income and expenditure
        let getIncomeSql = `select sum(quantity) from transactions_0 where params_to=? AND address_to=?`;
        let getExpenditureSql = `select sum(quantity) from transactions_0 where address_from=? AND address_to=?`;

        let income = await aelf0.query(getIncomeSql, [address, contract_address]);
        let expenditure = await aelf0.query(getExpenditureSql, [address, contract_address]);

        income = income[0]["sum(quantity)"];
        expenditure = expenditure[0]["sum(quantity)"]

        return {
            income: income,
            expenditure: expenditure,
            balance: income - expenditure
        };
        // let getInSql
    }

    async getTokens(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { address } = options;

        let sql = `select * from address_contracts,contract_aelf20 
                    where address=? 
                    And address_contracts.contract_address=contract_aelf20.contract_address`;

        let tokens = await aelf0.query(sql, [address]);

        return tokens;
    }

    async insertToken(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { address, contract_address } = options;

        let sql = `insert into address_contracts (address, contract_address) VALUES (?,?);`;

        let result = await aelf0.query(sql, [address, contract_address]);

        return result;
    }
}

module.exports = AddressService;