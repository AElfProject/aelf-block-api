/**
 * @file controller/nodes.js
 * @author huangzongzhe
 * 2018.08
 */
/* eslint-disable fecs-camelcase */
'use strict';

const Controller = require('egg').Controller;
const formatOutput = require('../utils/formatOutput.js');

class NodesController extends Controller {

    async getNodesInfo() {
        let ctx = this.ctx;
        try {
            // TODO: whitelist or API server must not open to Public.
            let result = await ctx.service.nodes.getNodesInfo();
            formatOutput(ctx, 'get', result);
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }
}

module.exports = NodesController;