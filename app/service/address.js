/**
 * @file service/address.js
 * @author huangzongzhe
 * 2018.08
 */
const elliptic = require('elliptic');

const ec = new elliptic.ec('secp256k1');
const BaseService = require('../core/baseService');
const {
  getOrSetCountCache,
  timeout
} = require('../utils/cacheCount');

// TODO:Balance 从 链上rpc拿，不再从sql中用sum获得
async function getBalance(options, aelf0) {
  const { address, contract_address } = options;
  // eslint-disable-next-line max-len
  const getIncomeSql = 'select sum(quantity) from transactions_0 where params_to=? AND address_to=? AND tx_status="Mined"';
  // eslint-disable-next-line max-len
  const getInitialBalanceIncomeSql = 'select quantity from transactions_0 where params_to=? AND method="InitialBalance"';
  const getExpenditureSql = 'select sum(quantity) from transactions_0 '
        + 'where address_from=? AND address_to=? AND tx_status="Mined"';

  const unionSql = getIncomeSql + ' UNION ALL ' + getExpenditureSql + ' UNION ALL ' + getInitialBalanceIncomeSql;

  const account = await aelf0.query(unionSql, [ address, contract_address, address, contract_address, address ]);

  let income = account[0]['sum(quantity)'];
  let expenditure = account[1]['sum(quantity)'];
  const balanceDefault = account[2] && account[2]['sum(quantity)'] || 0;

  income = parseInt(income || 0, 10) + parseInt(balanceDefault || 0, 10);
  income = !isNaN(income) ? income : 0;
  expenditure = expenditure ? parseInt(expenditure, 10) : 0;

  return {
    income,
    expenditure,
    balance: income - expenditure
  };
}

// class AddressService extends Service {
class AddressService extends BaseService {

  async getTransactions(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const { redisKeys } = this.app.config;
    let txsCount = await this.redisCommand('get', redisKeys.txsCount) || 0;
    txsCount = parseInt(txsCount, 10);
    const {
      limit,
      page,
      order,
      address,
      method
    } = options;
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;

      let methodMatchSql = '';
      let sqlValue = [ address, address, address ];
      let countSqlValue = [ address, address, address ];

      if (method) {
        methodMatchSql = 'and method=? ';
        sqlValue.push(method);
        countSqlValue = [ ...countSqlValue, method ];
      }
      sqlValue = [ ...sqlValue, limit, offset ];

      let whereCondition = `WHERE id BETWEEN ${limit - 1} AND ${txsCount - offset}`;
      if (order.toUpperCase() === 'ASC') {
        whereCondition = `WHERE id BETWEEN ${offset} AND ${txsCount}`;
      }

      // query by id in range
      const getTxsIdSql = `select id from transactions_0 
            ${whereCondition} AND (address_from=? or params_to=? or address_to=?) ${methodMatchSql}
            ORDER BY id ${order} limit ? offset ?`;
      const txsIds = await this.selectQuery(aelf0, getTxsIdSql, sqlValue);
      let txs = [];
      if (txsIds.length > 0) {
        const getTxsSql = `SELECT * FROM transactions_0 WHERE id in (${new Array(txsIds.length).fill('?').join(',')})`;
        txs = await this.selectQuery(aelf0, getTxsSql, txsIds.map(v => v.id));
      }

      const getCountSql = `select count(1) as total from transactions_0 
        where (address_from=? or params_to=? or address_to=?) ${methodMatchSql}`;
      const cacheKey = `${countSqlValue.join('_')}`;
      const result = await Promise.race([
        getOrSetCountCache(cacheKey, {
          func: this.selectQuery,
          args: [ aelf0, getCountSql, countSqlValue ]
        }, 3000),
        timeout(3000, [{
          total: 100000
        }])
      ]);
      return {
        total: result[0].total,
        transactions: txs
      };
    }

    return '傻逼，滚。';
  }

  async getBalance(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');

    const result = await getBalance(options, aelf0);
    return result;
  }

  async getTokens(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      address,
      limit,
      page,
      order,
      nodes_info
    } = options;

    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {

      let pageSql = '';
      let sqlValue = [ address ];
      if (limit) {
        const offset = limit * page;
        pageSql = 'limit ? offset ? ';
        sqlValue = [ address, limit, offset ];
      }

      if (nodes_info) {
        const selectSql = 'select * from address_contracts, nodes_0, contract_aelf20 '
                    + ' where address_contracts.contract_address=nodes_0.contract_address and '
                    + ' contract_aelf20.contract_address=address_contracts.contract_address and '
                    + ' contract_aelf20.symbol=address_contracts.symbol and '
                    + ' address_contracts.address=?'
                    + ` ORDER BY update_time ${order} ${pageSql};`;
        const tokens = await this.selectQuery(aelf0, selectSql, sqlValue);

        return tokens;
      }

      const sql = `select * from address_contracts,contract_aelf20 
                    where address=? and contract_aelf20.symbol=address_contracts.symbol 
                    And address_contracts.contract_address=contract_aelf20.contract_address
                    ORDER BY update_time ${order} ${pageSql}`;

      const tokens = await this.selectQuery(aelf0, sql, sqlValue);

      const promiseList = [];
      tokens.forEach(item => {
        promiseList.push(
          async () => {
            const result = await getBalance({
              address: item.address,
              contract_address: item.contract_address
            }, aelf0);
            Object.assign(result, item);
            return result;
          }
        );
      });
      const result = await Promise.all(promiseList);

      return result;
    }

    return '傻逼，滚。';
  }

  async bindToken(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      address,
      contract_address,
      symbol,
      signed_address,
      public_key
    } = options;

    // https://www.npmjs.com/package/elliptic; part: ECDSA
    // public_key { x: hex string, y: hex string };
    const key = ec.keyFromPublic(public_key, 'hex');
    const verifyResult = key.verify(address, signed_address);

    if (verifyResult) {
      const sql = 'insert into address_contracts (address, contract_address, symbol) VALUES (?,?,?);';
      const result = await this.selectQuery(aelf0, sql, [ address, contract_address, symbol ]);

      return result;
    }
    return 'error signature.';
  }

  async unbindToken(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      address,
      contract_address,
      symbol,
      signed_address,
      public_key
    } = options;

    // https://www.npmjs.com/package/elliptic; part: ECDSA
    // public_key { x: hex string, y: hex string };
    const key = ec.keyFromPublic(public_key, 'hex');
    const verifyResult = key.verify(address, signed_address);

    if (verifyResult) {
      const sql = 'delete from address_contracts WHERE address=? and contract_address=? and symbol=?';
      const result = await this.selectQuery(aelf0, sql, [ address, contract_address, symbol ]);
      return result;
    }
    return 'error signature.';
  }
}

module.exports = AddressService;
