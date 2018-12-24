/**
 * @file service/address.js
 * @author huangzongzhe
 * 2018.08
 */
/* eslint-disable fecs-camelcase */
const Service = require('egg').Service;

const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');

async function getBalance(options, aelf0) {
    const {address, contract_address} = options;
    const getIncomeSql
        = 'select sum(quantity) from transactions_0 where params_to=? AND address_to=? AND tx_status="Mined"';
    const getExpenditureSql
        = 'select sum(quantity) from transactions_0 '
        + 'where address_from=? AND address_to=? AND tx_status="Mined"';

    const unionSql = getIncomeSql + ' UNION ALL ' + getExpenditureSql;

    const account = await aelf0.query(unionSql, [address, contract_address, address, contract_address]);

    let income = account[0]['sum(quantity)'];
    let expenditure = account[1]['sum(quantity)'];

    income = income ? parseInt(income, 10) : 0;
    expenditure = expenditure ? parseInt(expenditure, 10) : 0;

    return {
        income,
        expenditure,
        balance: income - expenditure
    };
}

class AddressService extends Service {

    async getTransactions(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {limit, page, order, address, contract_address} = options;
        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {
            const offset = limit * page;

            let contractMatchSql = '';
            let sqlValue = [address, address, limit, offset];
            if (contract_address) {
                contractMatchSql = ' and address_to=? ';
                sqlValue = [address, address, contract_address, limit, offset];
            }

            const getTxsAndCountSql = `select *, count(*) AS total from transactions_0  
                            where (address_from=? or params_to=?) ${contractMatchSql} 
                            ORDER BY block_height ${order} limit ? offset ? `;

            let txsAndCount = await aelf0.query(getTxsAndCountSql, sqlValue);

            return {
                total: txsAndCount[0].total,
                transactions: txsAndCount
            };
        }
        return '傻逼，滚。';
    }

    async getBalance(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');

        let result = await getBalance(options, aelf0);
        return result;
    }

    async getTokens(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        let {address, limit, page, order, nodes_info} = options;

        if (['DESC', 'ASC', 'desc', 'asc'].includes(order)) {

            let pageSql = '';
            let sqlValue = [address];
            if (limit) {
                const offset = limit * page;
                pageSql = 'limit ? offset ? ';
                sqlValue = [address, limit, offset];
            }

            if (nodes_info) {
                const selectSql = 'select * from address_contracts, nodes_0, contract_aelf20 '
                    + ' where address_contracts.contract_address=nodes_0.contract_address and '
                    + ' contract_aelf20.contract_address=address_contracts.contract_address and '
                    + ' address_contracts.address=?'
                    + ` ORDER BY update_time ${order} ${pageSql};`;
                let tokens = await aelf0.query(selectSql, sqlValue);

                return tokens;
            }

            let sql = `select * from address_contracts,contract_aelf20 
                    where address=? 
                    And address_contracts.contract_address=contract_aelf20.contract_address
                    ORDER BY update_time ${order} ${pageSql}`;

            let tokens = await aelf0.query(sql, sqlValue);

            let promiseList = [];
            tokens.map(item => {
                promiseList.push(
                    new Promise(
                        async (resolve, reject) => {
                            try {
                                let result = await getBalance({
                                    address: item.address,
                                    contract_address: item.contract_address
                                }, aelf0);
                                Object.assign(result, item);
                                resolve(result);
                            }
                            catch(e) {
                                reject(e);
                            }

                        }
                    )
                );
            });
            let result = await Promise.all(promiseList);

            return result;
        }
        return '傻逼，滚。';
    }

    async bindToken(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const { address, contract_address, signed_address, public_key } = options;

        // https://www.npmjs.com/package/elliptic; part: ECDSA
        // public_key { x: hex string, y: hex string };
        let key = ec.keyFromPublic(public_key, 'hex');
        let verifyResult = key.verify(address, signed_address);

        if (verifyResult) {
            let sql = `insert into address_contracts (address, contract_address) VALUES (?,?);`;
            let result = await aelf0.query(sql, [address, contract_address]);

            return result;
        } else {
            return 'error signature.';
        }
    }

    async unbindToken(options) {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const {address, contract_address, signed_address, public_key} = options;

        // https://www.npmjs.com/package/elliptic; part: ECDSA
        // public_key { x: hex string, y: hex string };
        let key = ec.keyFromPublic(public_key, 'hex');
        let verifyResult = key.verify(address, signed_address);

        if (verifyResult) {
            let sql = `delete from address_contracts WHERE address = '${address}' and contract_address = '${contract_address}' `;
            let result = await aelf0.query(sql, [address, contract_address]);

            return result;
        } else {
            return 'error signature.';
        }
    }
}

module.exports = AddressService;
