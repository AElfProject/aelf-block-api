'use strict';

// had enabled by egg
// exports.static = true;

// exports.proxy = {
//   enable: true,
//   package: 'egg-proxy',
// };

exports.mysql = {
	enable: true,
	package: 'egg-mysql',
};

exports.validate = {
	enable: true,
	package: 'egg-validate',
};

exports.redis = {
	enable: true,
	package: 'egg-redis',
};

// exports.alinode = {
// 	enable: true,
// 	package: 'egg-alinode'
// };
