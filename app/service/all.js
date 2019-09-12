/**
 * @file
 * @author huangzongzhe
 * 2018.08
 */
const BaseService = require('../core/baseService');

class AllService extends BaseService {

  async getAllBlocks(options) {
    const { redisKeys } = this.app.config;
    let blocksCount = await this.redisCommand('get', redisKeys.blocksCount) || 0;
    blocksCount = parseInt(blocksCount, 10);
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const { limit, page, order = 'DESC' } = options;
    const offset = limit * page;
    let whereCondition = `WHERE id BETWEEN ${blocksCount - (page + 1) * limit - 1} AND ${blocksCount - offset}`;
    if (order.toUpperCase() === 'ASC') {
      whereCondition = `WHERE id BETWEEN ${offset + 1} AND ${(page + 1) * limit}`;
    }
    // todo: only get required fields, not all data
    const getBlocksSql = `select * from blocks_0 ${whereCondition} ORDER BY id ${order} limit ${limit}`;
    const blocks = await this.selectQuery(aelf0, getBlocksSql, [ limit, offset ]);
    return {
      total: blocksCount,
      blocks
    };
  }

  async getAllTransactions(options) {
    const { redisKeys } = this.app.config;
    let txsCount = await this.redisCommand('get', redisKeys.txsCount) || 0;
    txsCount = parseInt(txsCount, 10);
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const { limit, page, order = 'DESC' } = options;
    const offset = limit * page;
    let whereCondition = `WHERE id BETWEEN ${txsCount - (page + 1) * limit - 1} AND ${txsCount - offset}`;
    if (order.toUpperCase() === 'ASC') {
      whereCondition = `WHERE id BETWEEN ${offset + 1} AND ${(page + 1) * limit}`;
    }
    // todo: only get required fields, not all data
    const getTxsSql = `select * from transactions_0 ${whereCondition} ORDER BY id ${order} limit ${limit}`;
    const txs = await this.selectQuery(aelf0, getTxsSql, []);
    return {
      total: txsCount,
      transactions: txs
    };
  }
}

module.exports = AllService;
