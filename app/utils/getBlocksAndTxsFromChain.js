/**
 * @file get blocks and txs results from chain
 * @author atom-yang
 * @date 2019.09.09
 */
const AElf = require('aelf-sdk');
const Decimal = require('decimal.js');
const Scheduler = require('./scheduler');
const {
  getContract
} = require('./utils');

const TOKEN_DECIMALS = {
  ELF: 8
};
let tokenContract = null;

async function getTokenDecimal(aelf, symbol) {
  let decimal;
  if (!tokenContract) {
    tokenContract = await getContract(aelf.currentProvider.host, 'AElf.ContractNames.Token');
  }
  if (!TOKEN_DECIMALS[symbol]) {
    try {
      const tokenInfo = await tokenContract.GetTokenInfo.call({
        symbol
      });
      decimal = tokenInfo.decimals;
    } catch (e) {
      decimal = 8;
    }
    TOKEN_DECIMALS[symbol] = decimal;
  }
  return TOKEN_DECIMALS[symbol];
}

async function getFee(aelf, transaction) {
  const fee = AElf.pbUtils.getTransactionFee(transaction.Logs || []);
  const decimals = await Promise.all(fee.map(f => getTokenDecimal(aelf, f.symbol)));
  return fee.map((f, i) => ({
    ...f,
    amount: new Decimal(f.amount || 0).dividedBy(`1e${decimals[i]}`).toString()
  })).reduce((acc, v) => ({
    ...acc,
    [v.symbol]: v.amount
  }), {});
}

async function getTxs(aelf, blockInfo, limit = 100) {
  const { BlockHash, Header: { Time } } = blockInfo;
  const txs = await aelf.chain.getTxResults(BlockHash, 0, limit);
  return Promise.all(txs.map(async tx => ({
    ...tx,
    fee: await getFee(aelf, tx),
    time: Time
  })));
}

async function getDividend(aelf, chainId, height) {
  const name = chainId === 'AELF' ? 'Treasury' : 'Consensus';
  const dividendContract = await getContract(aelf.currentProvider.host, `AElf.ContractNames.${name}`);
  let dividends = await dividendContract.GetDividends.call({
    value: height
  });
  dividends = dividends && dividends.value ? dividends.value : {};
  const decimals = await Promise.all(Object.keys(dividends).map(symbol => getTokenDecimal(aelf, symbol)));
  return Object.keys(dividends).reduce((acc, v, i) => ({
    ...acc,
    [v]: +dividends[v] / `1e${decimals[i]}`
  }), {});
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
