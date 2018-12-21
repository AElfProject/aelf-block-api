/**
 * @file service/nodes.js
 * @author huangzongzhe
 * 2018.08
 */
/* eslint-disable fecs-camelcase */
const Service = require('egg').Service;

class NodesService extends Service {

    async getNodesInfo() {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const getQuery = 'select * from nodes_0';
        let nodesInfo = await aelf0.query(getQuery);
        return {
            list: nodesInfo
        };
    }
}

module.exports = NodesService;