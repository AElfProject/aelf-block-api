/**
 * @file token.js
 * @author huangzongzhe
 * 2019.09
 */

const {
  Controller
} = require('egg');
const formatOutput = require('../utils/formatOutput.js');

class TokenController extends Controller {

  /**
   * 获取对应时间段的TPS信息
   * http://localhost:7101/api/tps/list?start_time=1543470081680&end_time=1543473081680
   *
   * @API getTransactions
   * @param {Number} start_time 毫秒级别
   * @param {Number} end_time 毫秒级别
   * @return {Object}
   */
  // create transfer issue crossChainTransfer crossChainReceive
  async getTxs() {
    const {
      ctx
    } = this;
    try {
      const {
        symbol,
        address,
        limit,
        page,
        order,
        type
      } = ctx.request.query;

      const keysRule = {
        symbol: {
          type: 'string',
          required: false,
          allowEmpty: true
        },
        address: {
          type: 'string',
          required: false,
          allowEmpty: true
        },
        limit: 'number',
        page: 'number',
      };

      const options = {
        symbol,
        address,
        limit: parseInt(limit, 10) || 20,
        page: parseInt(page, 10) || 0,
        order: order || 'DESC',
        type: type || 'confirmed'
      };

      ctx.validate(keysRule, options);

      const result = await ctx.service.token.getTxs(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getPrice() {
    const {
      ctx
    } = this;

    const keysRule = {
      fsym: 'string',
      tsyms: 'string',
      force: {
        type: 'string',
        required: false,
        allowEmpty: true
      },
    };

    try {
      const {
        fsym,
        tsyms,
        force
      } = ctx.request.query;

      if (process.env.DISABLED_PRICE === 'disable' && !force) {
        return formatOutput(ctx, 'get', {});
      }

      const options = {
        fsym,
        tsyms
      };

      ctx.validate(keysRule, options);

      const result = await ctx.service.token.getPrice(options);

      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getPriceHistory() {
    const {
      ctx
    } = this;

    const keysRule = {
      date: 'string',
      token_id: 'string',
      vs_currencies: 'string',
    };

    try {
      const {
        date,
        token_id,
        vs_currencies
      } = ctx.request.query;

      const options = {
        date,
        token_id,
        vs_currencies
      };

      ctx.validate(keysRule, options);

      const result = await ctx.service.token.getPriceHistory(options);

      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getPrices() {
    const {
      ctx
    } = this;

    const keysRule = {
      pairs: 'array'
    };

    try {
      const {
        pairs
      } = ctx.request.body;

      const options = {
        pairs
      };

      ctx.validate(keysRule, options);

      const result = await ctx.service.token.getPrices(pairs);

      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getPricesTokensOfAelf() {
    const {
      ctx
    } = this;

    const {
      type = 'USD'
    } = ctx.request.query;

    try {

      const tokenList = await ctx.service.token.getTokenList({
        limit: 2000,
        page: 0
      });

      // TODO: valid token pool. if the same name in public market.
      // For Example: LOT, DISK, NET is now in public market.
      const validPool = [ 'ELF', 'AEUSD' ];
      const pairs = [];
      tokenList.forEach(token => {
        if (/^AE/.test(token.symbol) && token.symbol !== 'AEUSD') {
          pairs.push({
            fsym: token.symbol.replace(/^AE/, ''),
            tsyms: type
          });
        } else if (validPool.includes(token.symbol)) {
          pairs.push({
            fsym: token.symbol,
            tsyms: type
          });
        }
      });

      const result = await ctx.service.token.getPrices(pairs);

      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }

}

module.exports = TokenController;
