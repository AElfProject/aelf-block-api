/*
 * huangzongzhe
 * 2019.07
 */


const { Controller } = require('egg');
const formatOutput = require('../utils/formatOutput.js');

class AdminController extends Controller {

  async login() {
    const { ctx } = this;
    try {
      const {
        name,
        pass
      } = ctx.request.body;
      const result = await ctx.service.admin.login({ name, pass });
      ctx.cookies.set('user_id', decodeURIComponent('' + name));

      formatOutput(ctx, 'get', result);
    } catch (error) {
      ctx.cookies.set('user_id', null);
      formatOutput(ctx, 'error', error, 422);
    }
  }

  async getUserInfo() {
    const { ctx } = this;
    try {
      const user_id = ctx.cookies.get('user_id');
      formatOutput(ctx, 'get', user_id + 'ah');
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = AdminController;
