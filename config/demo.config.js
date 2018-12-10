/**
 * @file
 * @author huangzongzhe
 */
'use strict';

module.exports = appInfo => {
    const config = exports = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '';

    // add your config here
    config.middleware = [];

    config.mysql = {
        clients: {
            // clientId, get the instance of client, need use app.mysql.get('clientId')
            aelf0: {
                host: '127.0.0.1',
                port: '3306',
                // create a normal use but not use root.
                // CREATE USER 'normal_aelf'@'localhost' IDENTIFIED BY 'password';
                // GRANT select, insert, update, delete on aelf_test.* TO 'normal_aelf'@'localhost';
                user: 'normal_aelf',
                password: 'password',
                database: 'aelf_test',
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
    }

    // config.alinode = {
    // 	server: 'wss://agentserver.node.aliyun.com:8080',
    // 	appid: '',
    // 	secret: '',
    // 	logdir: '/tmp/'
    // 	// ,
    // 	// error_log: [
    // 	// 	'您的应用在业务层面产生的异常日志的路径，数组，可选，可配置多个',
    // 	// 	'例如：/root/.logs/error.#YYYY#-#MM#-#DD#.log',
    // 	// 	'不更改 Egg 默认日志输出路径可不配置本项目',
    // 	// ],
    // 	// agentidMode: 'IP'
    // 	// '可选，如果设置，则在实例ID中添加部分IP信息，用于多个实例 hostname 相同的场景（以容器为主）'
    // }

    return config;
};