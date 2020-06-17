/**
 * @file common utils
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const moment = require('moment');

function camelCaseToUnderScore(str = '') {
  return str.replace(/(.)([A-Z])/g, (_, p0, p1) => `${p0}_${p1.toLowerCase()}`);
}

function isObject(value) {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

function parseOrder(options = {}) {
  let { order = 'DESC' } = options;
  order = (order || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  return {
    ...options,
    order
  };
}
let zero = null;
let wallet = null;
let aelf = null;
const CONTRACT_INSTANCE = {};
async function getContract(endpoint, name) {
  if (!wallet) {
    wallet = AElf.wallet.createNewWallet();
    aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
    const status = await aelf.chain.getChainStatus();
    zero = status.GenesisContractAddress;
  }
  if (!CONTRACT_INSTANCE.Genesis) {
    CONTRACT_INSTANCE.Genesis = await aelf.chain.contractAt(zero, wallet);
  }
  if (!CONTRACT_INSTANCE[name]) {
    const address = await CONTRACT_INSTANCE.Genesis.GetContractAddressByName.call(AElf.utils.sha256(name));
    CONTRACT_INSTANCE[name] = await aelf.chain.contractAt(address, wallet);
  }
  return CONTRACT_INSTANCE[name];
}

function formatTimeRange(start, end, minRange) {
  const range = end - start;
  const newEnd = Math.floor(end / minRange) * minRange;
  const newStart = newEnd - range;
  return {
    start: newStart,
    end: newEnd
  };
}

async function getLocalTps(db, options = {}) {
  const {
    interval
  } = options;
  const {
    start,
    end
  } = formatTimeRange(options.start, options.end, interval);

  const sqlValue = [ moment(start).utc().format(), moment(end).utc().format() ];
  const getTpsSql = 'select time,tx_count from blocks_0 where time between ? and ?';

  const timeList = new Array(Math.ceil((end - start) / interval)).fill(1).map((_, i) => {
    return {
      start: start + interval * i,
      end: start + interval * (i + 1),
      count: 0
    };
  });

  const tps = await db.query(getTpsSql, sqlValue);

  tps.forEach(({ time, tx_count }) => {
    const timestamp = moment(time).valueOf();
    let index = Math.floor((timestamp - start) / interval);
    if (index === timeList.length) {
      index -= 1;
    }
    timeList[index] = {
      ...timeList[index],
      count: timeList[index].count + tx_count
    };
  });

  return timeList;
}

module.exports = {
  getContract,
  getLocalTps,
  formatTimeRange,
  camelCaseToUnderScore,
  isObject,
  parseOrder
};
