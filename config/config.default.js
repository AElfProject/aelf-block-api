/**
 * @file config for local
 * @author huangzongzhe
 */

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
        host: '127.0.0.1',
        // 端口号
        port: '3306',
        // 用户名
        user: 'root',
        // 密码
        password: 'password',
        // 数据库名
        database: 'aelf_main_chain'
      },
      viewer: {
        // host
        // host: 'mysql.com',
        host: '127.0.0.1',
        // 端口号
        port: '3306',
        // 用户名
        user: 'root',
        // 密码
        password: 'password',
        // 数据库名
        database: 'aelf_viewer'
      }
    },
    // 所有数据库配置的默认值
    default: {}
  };

  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
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
  config.endpoint = 'http://192.168.197.18:8000';

  config.sideChainAPI = [
    'http://18.179.200.57:7250'
  ];
  config.tpsInterval = 60 * 1000; // ms
  config.tpsListRedisKey = 'tps_list_3_h';

  // 广播间隔
  config.broadcastInterval = 2000; // ms

  config.logger = {
    consoleLevel: 'INFO'
  };
  return config;
};
