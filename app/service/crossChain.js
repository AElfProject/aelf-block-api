/**
 * @file service/crossChain.js
 * @author huangzongzhe
 * 2019.10
 */
const {
  Service
} = require('egg');

const AElf = require('aelf-sdk');
const {
  CrossChain
} = require('aelf-sdk-cross-chain');

const Wallet = AElf.wallet;

// address: 2hxkDg6Pd2d4yU1A16PTZVMMrEDYEPR8oQojMDwWdax5LsBaxX
const defaultPrivateKey = 'bdb3b39ef4cd18c2697a920eb6d9e8c3cf1a930570beb37d04fb52400092c42b';
const wallet = Wallet.getWalletByPrivateKey(defaultPrivateKey);

const crossChainInstanceList = {};

class CrossChainService extends Service {

  async isReadyToReceive(options) {

    const {
      send,
      receive,
      mainChainId,
      issueChainId,
      crossTransferTxId
    } = options;

    // console.log('crossChainInstance', !!crossChainInstanceList[send + receive], JSON.stringify(options));
    let crossChainInstance = {};
    if (crossChainInstanceList[send + receive]) {
      crossChainInstance = crossChainInstanceList[send + receive];
    } else {
      const receiveInstance = new AElf(new AElf.providers.HttpProvider(receive));
      // const receiveInstance = new AElf(new AElf.providers.HttpProvider('http://13.231.179.27:8000'));
      // const sendInstance = new AElf(new AElf.providers.HttpProvider('http://52.68.97.242:8000'));
      const sendInstance = new AElf(new AElf.providers.HttpProvider(send));

      crossChainInstance = new CrossChain({
        AElfUtils: AElf.utils,
        sendInstance,
        receiveInstance,
        wallet,
        mainChainId,
        issueChainId,
        queryLimit: 1
      });
      await crossChainInstance.init({});
      crossChainInstanceList[send + receive] = crossChainInstance;
    }

    // console.log('crossChainInstance', !!crossChainInstanceList[send + receive]);

    const isReadyToReceive = await crossChainInstance.isChainReadyToReceive({
      crossTransferTxId
    });
    return {
      isReadyToReceive
    };
  }
}

module.exports = CrossChainService;
