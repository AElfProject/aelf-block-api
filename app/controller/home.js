/*
 * huangzongzhe
 * 2018.08
 */
'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, this is aelf-block-api.';
  }
}

module.exports = HomeController;
