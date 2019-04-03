/**
 * @file router.js
 * @author huangzongzhe
 * @param {Egg.Application} app - egg application
 */
'use strict';
module.exports = app => {
    const {
        router,
        controller
    } = app;
    router.get('/', controller.home.index);
    router.get('/api/transactions', controller.api.getTransactions);
    router.post('/api/transactions', controller.api.postTransactions);

    router.get('/api/all/blocks', controller.all.getAllBlocks);
    router.get('/api/all/transactions', controller.all.getAllTransactions);

    router.get('/api/block/transactions', controller.block.getTransactions);

    router.get('/api/chain/blocks', controller.chain.getBlocks);
    router.get('/api/chain/transactions', controller.chain.getTransactions);

    router.get('/api/address/transactions', controller.address.getTransactions);
    router.get('/api/address/balance', controller.address.getBalance);
    router.get('/api/address/tokens', controller.address.getTokens);
    router.post('/api/address/bind-token', controller.address.bindToken);
    router.post('/api/address/unbind-token', controller.address.unbindToken);

    router.get('/api/contract/detail', controller.contract.getDetail);
    router.get('/api/contract/contracts', controller.contract.getContracts);
    router.post('/api/contract/contract', controller.contract.insertContract);
    router.get('/api/contract/searchtoken', controller.contract.searchToken);

    router.get('/api/huobi/detail', controller.huobi.getDetail);

    router.get('/api/tps/list', controller.tps.getTps);

    router.get('/api/nodes/info', controller.nodes.getNodesInfo);
    router.post('/api/nodes/info', controller.nodes.postNodesInfo);
    router.put('/api/nodes/info', controller.nodes.putNodesInfo);

    router.get('/api/resource/records', controller.resource.getRecords);
    router.get('/api/resource/realtime-records', controller.resource.getRealtimeRecords);
    router.get('/api/resource/turnover', controller.resource.getTurnover);
};
