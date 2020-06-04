/**
 * @file get blocks and txs results from chain
 * @author atom-yang
 * @date 2019.09.09
 */
const AElf = require('aelf-sdk');
const Scheduler = require('./scheduler');
const {
  getContract
} = require('./utils');

function getFee(transaction) {
  const elfFee = AElf.pbUtils.getTransactionFee(transaction.Logs || []);
  return elfFee.length === 0 ? 0 : (+elfFee[0].amount / 1e8);
}

async function getTxs(aelf, blockInfo, limit = 100) {
  const { BlockHash, Header: { Time } } = blockInfo;
  const txs = await aelf.chain.getTxResults(BlockHash, 0, limit);
  return txs.map(tx => ({
    ...tx,
    fee: getFee(tx),
    time: Time
  }));
}

async function getDividend(aelf, chainId, height) {
  const name = chainId === 'AELF' ? 'Treasury' : 'Consensus';
  const dividendContract = await getContract(aelf.currentProvider.host, `AElf.ContractNames.${name}`);
  let dividends = await dividendContract.GetDividends.call({
    value: height
  });
  dividends = dividends && dividends.value ? dividends.value : {};
  return (dividends.ELF || 0) / 1e8;
}

function getMiner(blockInfo) {
  const {
    Header: {
      SignerPubkey
    }
  } = blockInfo;
  return SignerPubkey ? AElf.wallet.getAddressFromPubKey(
    AElf.wallet.ellipticEc.keyFromPublic(SignerPubkey, 'hex').getPublic()
  ) : '';
}

async function getBlock(aelf, status, height) {
  const blockInfo = await aelf.chain.getBlockByHeight(height, true);
  if (!blockInfo) {
    throw new Error(`empty block at height ${height}`);
  }
  const txs = await getTxs(aelf, blockInfo);
  return {
    block: {
      ...blockInfo,
      dividend: await getDividend(aelf, status.ChainId, height),
      miner: getMiner(blockInfo)
    },
    txs
  };
}

async function getBlocks(aelf, lastHeight, heightKey) {
  const status = await aelf.chain.getChainStatus();
  const height = parseInt(status[heightKey], 10);
  let gap = height - lastHeight;
  gap = gap <= 0 ? 0 : gap;
  const gapArr = new Array(gap || 0).fill(1).map((_, index) => index + lastHeight + 1);
  const results = await Promise.all(gapArr.map(v => getBlock(aelf, status, v)));
  return {
    results,
    currentHeight: height
  };
}

const cacheConfig = {
  expireTimeout: 60000 // ms
};

function getBlocksAndTxsFromChain(app, aelf, cache, startHeight) {
  let lastHeight = startHeight;
  const scheduler = new Scheduler({
    interval: app.config.broadcastInterval
  });
  scheduler.setCallback(async () => {
    try {
      const {
        results,
        currentHeight
      } = await getBlocks(aelf, lastHeight, app.config.heightKey);
      if (results.length === 0) {
        return;
      }
      results.forEach(value => {
        const height = value.block.Header.Height;
        cache.initCache(height, value, cacheConfig);
      });
      lastHeight = currentHeight;
      app.config.lastHeight = app.config.currentHeight;
      app.config.currentHeight = currentHeight;
    } catch (e) {
      console.log(e);
    }
  });
  scheduler.startTimer();
}

module.exports = getBlocksAndTxsFromChain;
