/*
 * huangzongzhe
 * 2018.11
 */


const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

const keysRule = {
  start: {
    type: 'int',
    convertType: 'int',
    required: true
  },
  end: {
    type: 'int',
    convertType: 'int',
    required: true
  },
  interval: {
    type: 'int',
    convertType: 'int',
    required: true
  }
};

class TpsController extends Controller {

  async getTps() {
    const { ctx } = this;
    try {
      const result = await ctx.service.tps.getTps();
      formatOutput(ctx, 'get', {
        list: result
      });
    } catch (error) {
      console.error(error);
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getAll() {
    const { ctx } = this;
    try {
      ctx.validate(keysRule, ctx.request.query);

      const result = await ctx.service.tps.getAll();

      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = TpsController;
