/**
 * @file
 * @author huangzongzhe
 */
'use strict';

module.exports = appInfo => {
    const config = exports = {};

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
                user: 'normal_aelf',
                // 密码
                password: 'password',
                // 数据库名
                database: 'aelf_test'
            }
            // ,
            // db2: {
            //   // host
            //   host: 'mysql2.com',
            //   // 端口号
            //   port: '3307',
            //   // 用户名
            //   user: 'test_user',
            //   // 密码
            //   password: 'test_password',
            //   // 数据库名
            //   database: 'test',
            // },
            // ...
        },
        // 所有数据库配置的默认值
        default: {

        },

        // 是否加载到 app 上，默认开启
        app: true,
        // 是否加载到 agent 上，默认关闭
        agent: false,
    };

    config.redis = {
        client: {
            port: 6379,          // Redis port
            host: '127.0.0.1',   // Redis host
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

    return config;
};
