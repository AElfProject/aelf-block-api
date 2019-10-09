/*
 * huangzongzhe
 * 2019.10
 */

const {
  Controller
} = require('egg');
const formatOutput = require('../utils/formatOutput.js');

class CrossChainController extends Controller {

  // http://localhost:7101/api/cross-chain/is-ready-to-receive?
  // send=http://52.68.97.242:8000&
  // receive=http://13.231.179.27:8000&
  // main_chain_id=4200270&
  // issue_chain_id=4200270&
  // cross_transfer_tx_id=31e1a12814dd89b8fae1bd00a7fe771f6445b7a2832adc2f552657a37090bef0
  async isReadyToReceive() {
    const {
      ctx
    } = this;
    try {
      const {
        send,
        receive,
        main_chain_id: mainChainId,
        issue_chain_id: issueChainId,
        cross_transfer_tx_id: crossTransferTxId
      } = ctx.request.query;
      const options = {
        send,
        receive,
        mainChainId: parseInt(mainChainId, 10),
        issueChainId: parseInt(issueChainId, 10),
        crossTransferTxId
      };
      const rule = {
        send: 'string',
        receive: 'string',
        mainChainId: 'int',
        issueChainId: 'int',
        crossTransferTxId: 'string'
      };
      ctx.validate(rule, options);
      const result = await ctx.service.crossChain.isReadyToReceive(options);
      formatOutput(ctx, 'get', result);
    } catch (error) {
      formatOutput(ctx, 'error', error, 422);
    }
  }
}

module.exports = CrossChainController;
