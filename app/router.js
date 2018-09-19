'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
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

	router.get('/api/contract/detail', controller.contract.getDetail);
	router.get('/api/contract/contracts', controller.contract.getContracts);
};