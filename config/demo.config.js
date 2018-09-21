'use strict';

module.exports = appInfo => {
	const config = exports = {};

	// use for cookie sign key, should change to your own and keep security
	config.keys = appInfo.name + '';

	// add your config here
	config.middleware = [];

	config.mysql = {
		clients: {
			// clientId, 获取client实例，需要通过 app.mysql.get('clientId') 获取
			aelf0: {
				// host
				// host: 'mysql.com',
				host: 'localhost',
				// 端口号
				port: '3306',
				// 用户名
				user: '',
				// 密码
				password: '',
				// 数据库名
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