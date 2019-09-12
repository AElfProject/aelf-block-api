/**
 * @file service/contract.js
 * @author huangzongzhe
 * 2018.08
 */
// const Service = require('egg').Service;
const BaseService = require('../core/baseService');

class ContractService extends BaseService {

  async getDetail(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const { contract_address } = options;

    const detailSql = 'select * from contract_aelf20 where contract_address=?';

    const detail = await aelf0.query(detailSql, [ contract_address ]);
    // let result = await aelf0.query('select * from blocks_0 ORDER BY block_height ASC limit 10 offset 0');
    return detail;
  }

  async getContracts(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, order, chain_id
    } = options;
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const offset = limit * page;

      let contractMatchSql = '';
      let sqlValue = [ limit, offset ];
      if (chain_id) {
        contractMatchSql = ' where chain_id=? ';
        sqlValue = [ chain_id, limit, offset ];
      }

      const getTxsSql = `select * from contract_aelf20  
                             ${contractMatchSql} 
                            ORDER BY name ${order} limit ? offset ? `;
      const getCountSql = `select count(*) as total from contract_aelf20 ${contractMatchSql}`;

      const txs = await this.selectQuery(aelf0, getTxsSql, sqlValue);
      const count = await this.selectQuery(aelf0, getCountSql, [ chain_id ]);

      return {
        total: count[0]['count(*)'],
        transactions: txs
      };
    }
    return '傻逼，滚。';
  }

  async insertContract(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      contract_address,
      chain_id,
      block_hash,
      tx_id,
      symbol,
      name,
      total_supply,
      decimals
    } = options;
    const string
            = [ 'contract_address', 'chain_id', 'block_hash', 'tx_id', 'symbol', 'name', 'total_supply', 'decimals' ];
    const blanks = '?, ?, ?, ?, ?, ?, ?, ?';
    const insertSql = `insert into contract_aelf20 (${string.join(',')}) Values (${blanks})`;

    const contracts = await aelf0.query(
      insertSql,
      [ contract_address, chain_id, block_hash, tx_id, symbol, name, total_supply, decimals ]
    );

    return contracts;

  }

  // 查询token
  async searchToken(options) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      name,
      order
    } = options;
    if ([ 'DESC', 'ASC', 'desc', 'asc' ].includes(order)) {
      const getTxsSql = `select * from contract_aelf20 WHERE name LIKE '%${name}%'`;
      const txs = await this.selectQuery(aelf0, getTxsSql, []);
      return txs;
    }
    return '傻逼，滚。';
  }
}

module.exports = ContractService;
