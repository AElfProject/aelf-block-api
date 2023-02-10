/**
 * @file
 * @author huangzongzhe
 * 2018.08
 */
const BaseService = require('../core/baseService');
const utils = require('../utils/utils');

class AllService extends BaseService {

  async getUnconfirmedBlocksCount() {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const getCountSql = 'select count(1) AS total from blocks_unconfirmed';
    const count = await this.selectQuery(aelf0, getCountSql, []);
    return +count[0].total;
  }

  async getAllBlocksCount() {
    const { redisKeys } = this.app.config;
    let blocksCount = await this.redisCommand('get', redisKeys.blocksCount) || 0;
    blocksCount = parseInt(blocksCount, 10);

    return blocksCount;
  }

  async getUnconfirmedTransactionsCount() {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const getCountSql = 'select count(1) AS total from transactions_unconfirmed';
    const count = await this.selectQuery(aelf0, getCountSql, []);
    return +count[0].total;
  }

  async getAllTransactionsCount() {
    const { redisKeys } = this.app.config;
    let txsCount = await this.redisCommand('get', redisKeys.txsCount) || 0;
    txsCount = parseInt(txsCount, 10);
    return txsCount;
  }

  async getUnconfirmedBlocks(options) {
    const {
      limit, page, order, offset: _offset
    } = utils.parseOrder(options);
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const offset = typeof _offset !== 'undefined' ? _offset : limit * page;
    // eslint-disable-next-line max-len
    const getBlocksSql = `select * from blocks_unconfirmed order by id ${order} limit ? offset ?`;
    const getCountSql = 'select count(1) AS total from blocks_unconfirmed';
    const [ blocks, total ] = await Promise.all([
      this.selectQuery(aelf0, getBlocksSql, [ limit, offset ]),
      this.selectQuery(aelf0, getCountSql, []),
    ]);
    return {
      total: +total[0].total,
      blocks
    };
  }

  async getUnconfirmedTransactions(options) {
    const {
      limit, page, order, offset: _offset
    } = utils.parseOrder(options);
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const offset = typeof _offset !== 'undefined' ? _offset : limit * page;
    // eslint-disable-next-line max-len
    const getTransactionsSql = `select * from transactions_unconfirmed order by id ${order} limit ? offset ?`;
    const getCountSql = 'select count(1) AS total from transactions_unconfirmed';
    const [
      transactions,
      total
    ] = await Promise.all([
      this.selectQuery(aelf0, getTransactionsSql, [ limit, offset ]),
      this.selectQuery(aelf0, getCountSql, [])
    ]);
    return {
      total: +total[0].total,
      transactions
    };
  }

  async getAllBlocks(options) {
    const { redisKeys } = this.app.config;
    let blocksCount = await this.redisCommand('get', redisKeys.blocksCount) || 0;
    blocksCount = parseInt(blocksCount, 10);
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, order, offset: _offset
    } = utils.parseOrder(options);
    const offset = typeof _offset !== 'undefined' ? _offset : limit * page;
    let blocksHeights = new Array(limit).fill(0).map((_, i) => {
      return blocksCount - offset - i;
    });
    if (order.toUpperCase() === 'ASC') {
      blocksHeights = new Array(limit).fill(0).map((_, i) => {
        return i + offset + 1;
      });
    }
    blocksHeights = blocksHeights.filter(v => v > 0 && v <= blocksCount);
    // eslint-disable-next-line max-len
    const getBlocksSql = `select * from blocks_0 where block_height in (${new Array(blocksHeights.length).fill('?').join(',')}) order by block_height ${order} limit ?`;
    const blocks = await this.selectQuery(aelf0, getBlocksSql, [ ...blocksHeights, limit ]);
    return {
      total: blocksCount,
      blocks
    };
  }

  async getAllBlocksInner(options) {
    const { redisKeys } = this.app.config;
    let blocksCount = await this.redisCommand('get', redisKeys.blocksCount) || 0;
    blocksCount = parseInt(blocksCount, 10);
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      limit, page, order, offset: _offset
    } = utils.parseOrder(options);
    const offset = typeof _offset !== 'undefined' ? _offset : limit * page;
    const getBlocksSql = `select * from blocks_0 order by block_height ${order} limit ? offset ?`;
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
    const {
      limit, page, order, offset: _offset,
    } = utils.parseOrder(options);
    const tempLimit = options.tLimit || limit;
    const offset = typeof _offset !== 'undefined' ? _offset : limit * page;
    const buffer = 20000;
    let whereCondition = `WHERE id BETWEEN ${offset + 1} AND ${(page + 1) * limit + buffer}`;
    let maxId = 0;
    if (order.toUpperCase() === 'DESC') {
      const maxIdSql = 'select id from transactions_0 ORDER BY id DESC LIMIT 1';
      maxId = await this.selectQuery(aelf0, maxIdSql, []);
      maxId = maxId[0].id;
      let floor = maxId - (page + 1) * limit - 1 - buffer;
      floor = floor <= 0 ? 1 : floor;
      whereCondition = `WHERE id BETWEEN ${floor} AND ${maxId - offset}`;
    }
    const getTxsSql = `select id from transactions_0 ${whereCondition} ORDER BY id ${order} limit ?`;
    const txsIds = await this.selectQuery(aelf0, getTxsSql, [ tempLimit, offset ]);
    let txs = [];
    if (txsIds.length > 0) {
      txs = await this.selectQuery(
        aelf0,
        `select * from transactions_0 where id in (${new Array(txsIds.length).fill('?').join(',')}) ORDER BY id ${order}`,
        txsIds.map(v => v.id)
      );
    }
    return {
      total: maxId || txsCount,
      transactions: await this.service.getTransferAmount.filter(txs)
    };
  }
}

module.exports = AllService;
