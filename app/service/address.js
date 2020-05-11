/**
 * @file service/address.js
 * @author huangzongzhe
 * 2018.08
 */
const elliptic = require('elliptic');

const ec = new elliptic.ec('secp256k1');
const utils = require('../utils/utils');
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
    const {
      limit,
      page,
      order,
      address
    } = utils.parseOrder(options);
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;
      const queryOption = [ address, address ];
      const countSqlValue = [ address ];
      const pageOption = [ limit, offset ];
      let sqlValue = [ ...queryOption, ...pageOption ];

      const results = await Promise.all([
        'select count(1) as total from transactions_0 where address_from=?',
        'select count(1) as total from transactions_0 where address_to=?'
      ].map((v, index) => {
        const cacheKey = `${address}_${index}`;
        return Promise.race([
          getOrSetCountCache(cacheKey, {
            func: this.selectQuery,
            args: [ aelf0, v, countSqlValue ]
          }, 3000),
          timeout(3000, [{
            total: 100000
          }])
        ]).then(result => {
          if (result[0].total) {
            return result[0].total;
          }
          return 0;
        });
      }));
      const total = results.reduce((acc, v) => acc + parseInt(v, 10), 0);
      if (total === 0) {
        return {
          total: 0,
          transactions: []
        };
      }
      let getTxsIdSql = `select id from transactions_0 where address_from=? or address_to=? ORDER BY id ${order} limit ? offset ?`;
      const [ countFrom, countTo ] = results;
      if (parseInt(countFrom, 10) === 0) {
        sqlValue = [ ...countSqlValue, ...pageOption ];
        getTxsIdSql = `SELECT id FROM transactions_0 WHERE address_to=? ORDER BY id ${order} limit ? offset ?`;
      }
      if (parseInt(countTo, 10) === 0) {
        sqlValue = [ ...countSqlValue, ...pageOption ];
        getTxsIdSql = `SELECT id FROM transactions_0 WHERE address_from=? ORDER BY id ${order} limit ? offset ?`;
      }
      // query by id in range
      // eslint-disable-next-line max-len
      const txsIds = await this.selectQuery(aelf0, getTxsIdSql, sqlValue);
      let txs = [];
      if (txsIds.length > 0) {
        const getTxsSql = `SELECT * FROM transactions_0 WHERE id in (${new Array(txsIds.length).fill('?').join(',')}) ORDER BY id ${order}`;
        txs = await this.selectQuery(aelf0, getTxsSql, txsIds.map(v => v.id));
      }
      return {
        total,
        transactions: await this.service.getTransferAmount.filter(txs)
      };
    }

    return 'error';
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

    return 'error';
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
      const preSql = 'select id from address_contracts where address = ? AND contract_address = ? AND symbol = ?';
      const preResult = await this.selectQuery(aelf0, preSql, [ address, contract_address, symbol ]);
      if (preResult && preResult.length > 0) {
        return `Duplicated bind token ${symbol}`;
      }
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
