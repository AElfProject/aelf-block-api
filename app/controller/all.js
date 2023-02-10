/*
 * huangzongzhe
 * 2018.08
 */


// 想想有没有什么更加合适的命名。。。

const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

const blocksRule = {
  order: 'string',
  limit: 'int',
  page: 'int'
};

class AllController extends Controller {

  async getAllBlocks() {
    const { ctx } = this;
    try {
      const { limit, page, order } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC'
      };
      ctx.validate(blocksRule, options);
      const result = await ctx.service.all.getAllBlocks(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getAllTransactions() {
    const { ctx } = this;
    try {
      const { limit, page, order } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      ctx.validate(blocksRule, options);
      const result = await ctx.service.all.getAllTransactions(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getUnconfirmedBlocks() {
    const { ctx } = this;
    try {
      const {
        limit = 25,
        page = 0,
        order = 'DESC'
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      ctx.validate(blocksRule, options);
      const result = await ctx.service.all.getUnconfirmedBlocks(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getAllBlocksCount() {
    const { ctx } = this;
    return Promise.all([
      ctx.service.all.getUnconfirmedBlocksCount(),
      ctx.service.all.getAllBlocksCount(),
    ]);
  }

  async getAllBlocksByDesc(options) {
    const { ctx } = this;
    const { page, limit } = options;
    const [ unconfirmedBlocksCount, blocksCount ] = await this.getAllBlocksCount();
    const total = unconfirmedBlocksCount + blocksCount;
    if (total < page * limit) {
      return {
        total,
        blocks: []
      };
    }

    let result = {};
    const pageEndOffset = (page + 1) * limit;
    const pageStartOffset = page * limit;
    // Only take Unconfirmed
    if (pageEndOffset <= unconfirmedBlocksCount) {
      result = await ctx.service.all.getUnconfirmedBlocks(options);
    } else {
      if (pageStartOffset >= unconfirmedBlocksCount) {
        result = await ctx.service.all.getAllBlocks({
          limit,
          offset: pageStartOffset - unconfirmedBlocksCount,
        });
      } else {
        const unconfirmedResult = await ctx.service.all.getUnconfirmedBlocks({
          limit,
          offset: pageStartOffset,
        });
        const allBlocksResult =
          await ctx.service.all.getAllBlocks({
            offset: 0,
            limit: pageEndOffset - (unconfirmedBlocksCount - pageStartOffset),
          });
        result = {
          blocks: [ ...unconfirmedResult.blocks, ...allBlocksResult.blocks ]
        };
      }
    }
    return {
      total,
      blocks: result.blocks,
    };
  }

  async getAllBlocksByAsc(options) {
    const { ctx } = this;
    const { page, limit } = options;
    const [ unconfirmedBlocksCount, blocksCount ] = await this.getAllBlocksCount();
    const total = unconfirmedBlocksCount + blocksCount;
    if (total < page * limit) {
      return {
        total,
        blocks: []
      };
    }

    let result = {};
    // Only take Unconfirmed
    if ((page + 1) * limit < blocksCount) {
      result = await ctx.service.all.getAllBlocks(options);
    } else {
      const _offset = page * limit - blocksCount;
      const offset = _offset < 0 ? undefined : _offset;
      // Only take all confirmed
      if ((page + 1) * limit - blocksCount > limit) {
        result = await ctx.service.all.getUnconfirmedBlocks({ ...options, offset });
      } else if ((page + 1) * limit - blocksCount === limit) {
        result = await ctx.service.all.getUnconfirmedBlocks({ ...options, offset, page: 0 });
      } else {
        // Contains both confirmed and Unconfirmed
        const allBlocksResult = await ctx.service.all.getAllBlocks(options);
        const unconfirmedResult = await ctx.service.all.getUnconfirmedBlocks({ ...options, offset, });
        result = {
          blocks: [ ...allBlocksResult.blocks, ...unconfirmedResult.blocks ]
        };
      }
    }
    return {
      total: unconfirmedBlocksCount + blocksCount,
      blocks: result.blocks,
    };
  }

  async getAllBlocksAndUnconfirmed() {
    const { ctx } = this;
    try {
      const {
        limit = 25,
        page = 0,
        order = 'DESC'
      } = ctx.request.query;

      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      ctx.validate(blocksRule, options);
      let result;
      if (order.toLocaleUpperCase() === 'DESC') {
        result = await this.getAllBlocksByDesc(options);
      } else {
        result = await this.getAllBlocksByAsc(options);
      }

      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getUnconfirmedTransactions() {
    const { ctx } = this;
    try {
      const {
        limit = 25,
        page = 0,
        order = 'DESC'
      } = ctx.request.query;
      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      ctx.validate(blocksRule, options);
      const result = await ctx.service.all.getUnconfirmedTransactions(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getAllTransactionsCount() {
    const { ctx } = this;
    return Promise.all([
      ctx.service.all.getUnconfirmedTransactionsCount(),
      ctx.service.all.getAllTransactionsCount(),
    ]);
  }

  async getAllTransactionsByDesc(options) {
    try {
      const { ctx } = this;
      const { page, limit } = options;
      const [ unconfirmedCount, allCount ] = await this.getAllTransactionsCount();
      const total = unconfirmedCount + allCount;
      if (total < page * limit) {
        return {
          total,
          transactions: []
        };
      }

      let result = {};
      // Only take Unconfirmed
      if ((page + 1) * limit < unconfirmedCount) {
        result = await ctx.service.all.getUnconfirmedTransactions(options);
      } else {
        const offset = page * limit - unconfirmedCount;
        // Only take all confirmed
        if ((page + 1) * limit - unconfirmedCount > limit) {
          options.offset = offset;
          result = await ctx.service.all.getAllTransactions(options);
        } else if ((page + 1) * limit - allCount === limit) {
          result = await ctx.service.all.getAllTransactions({ ...options, offset, page: 0 });
        } else {
          // Contains both confirmed and Unconfirmed
          const unconfirmedResult = await ctx.service.all.getUnconfirmedTransactions(options);
          const allResult =
          await ctx.service.all.getAllTransactions({ ...options, offset, tLimit: limit - unconfirmedResult.transactions.length });
          result = {
            transactions: [ ...unconfirmedResult.transactions, ...allResult.transactions ]
          };
        }
      }
      return {
        total,
        transactions: result.transactions,
      };
    } catch (error) {
      console.log(error, 'error===');
    }
  }

  async getAllTransactionsByAsc(options) {
    const { ctx } = this;
    const { page, limit } = options;
    const [ unconfirmedCount, allCount ] = await this.getAllTransactionsCount();
    const total = unconfirmedCount + allCount;
    if (total < page * limit) {
      return {
        total,
        transactions: []
      };
    }

    let result = {};
    // Only take Unconfirmed
    if ((page + 1) * limit < allCount) {
      result = await ctx.service.all.getAllTransactions(options);
    } else {
      const _offset = page * limit - allCount;
      const offset = _offset < 0 ? undefined : _offset;
      // Only take all confirmed
      if ((page + 1) * limit - allCount > limit) {
        result = await ctx.service.all.getUnconfirmedTransactions({ ...options, offset });
      } else if ((page + 1) * limit - allCount === limit) {
        result = await ctx.service.all.getUnconfirmedTransactions({ ...options, offset, page: 0 });
      } else {
        // Contains both confirmed and Unconfirmed
        const allResult = await ctx.service.all.getAllTransactions(options);
        const unconfirmedResult =
        await ctx.service.all.getUnconfirmedTransactions({ ...options, page: 0, limit: limit - allResult.transactions.length });
        result = {
          transactions: [ ...allResult.transactions, ...unconfirmedResult.transactions ]
        };
      }
    }
    return {
      total: unconfirmedCount + allCount,
      transactions: result.transactions,
    };
  }


  async getAllTransactionsAndUnconfirmed() {
    const { ctx } = this;
    try {
      const {
        limit = 25,
        page = 0,
        order = 'DESC'
      } = ctx.request.query;

      const options = {
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        order: order || 'DESC',
      };
      ctx.validate(blocksRule, options);
      let result;
      if (order.toLocaleUpperCase() === 'DESC') {
        result = await this.getAllTransactionsByDesc(options);
      } else {
        result = await this.getAllTransactionsByAsc(options);
      }
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = AllController;
