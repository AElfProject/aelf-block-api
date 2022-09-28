/**
 * @file config for local
 * @author huangzongzhe
 */
const dotenv = require('dotenv');

dotenv.config('../.env');

module.exports = appInfo => {
  exports = {};
  const config = exports;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1534330911033_3241';

  // add your config here
  config.middleware = [];

  config.mysql = {
    clients: {
      // clientId, 获取client实例，需要通过 app.mysql.get('clientId') 获取
      aelf0: {
        // host
        // host: 'mysql.com',
        host: process.env.DATABASE_HOST,
        // 端口号
        port: '3306',
        // 用户名
        user: process.env.DATABASE_USER_NAME,
        // 密码
        password: process.env.DATABASE_PASSWORD,
        // 数据库名
        database: process.env.DATABASE_NAME,
        charset: 'utf8mb4'
      }
    },
    // 所有数据库配置的默认值
    default: {}
  };

  config.redis = {
    client: {
      port: 6379, // Redis port
      host: process.env.REDIS_HOST, // Redis host
      db: 0,
      password: null
    }
  };

  config.redisKeys = {
    blocksCount: 'blocks_count',
    blocksUnconfirmedCount: 'blocks_unconfirmed_count',
    txsCount: 'txs_count',
    txsUnconfirmedCount: 'txs_unconfirmed_count',
    resourceCount: 'resource_count',
    resourceUnconfirmedCount: 'resource_unconfirmed_count',
    tokenCount: 'token_count',
    LIBHeight: 'lib_height',
    bestHeight: 'best_height'
  };

  config.security = {
    csrf: {
      enable: process.env.NODE_ENV === 'production'
    }
  };
  config.io = {
    init: {
      path: '/socket',
      transports: [ 'websocket', 'polling' ]
    },
    namespace: {
      '/': {
        connectionMiddleware: [ 'connection' ],
        packetMiddleware: [ 'format' ]
      }
    },
    // cluster 模式下，通过 redis 实现数据共享
    redis: {
      host: '127.0.0.1',
      port: 6379,
    },
  };

  // 节点地址
  config.endpoint = process.env.CHAIN_ENDPOINT;

  config.sideChainAPI = process.env.SIDE_CHAIN_APIS.split(',').filter(v => v !== '');
  config.tpsInterval = 60 * 1000; // ms
  // config.tpsListRedisKey = 'tps_list_3_h';
  config.tpsListRedisKey = process.env.TPS_LIST_REDIS_KEY;

  // 广播间隔
  config.broadcastInterval = 2000; // ms

  config.logger = {
    consoleLevel: 'INFO'
  };

  config.cache = {
    priceHistoryLength: 200
  };

  return config;
};
