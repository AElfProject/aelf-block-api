# AElf Block API

## Quick Start

Please ensure your dependencies are ready.

If you meet some permission problem, try to use 'sudo'.

```bash
bash build.sh < type|optional> < node_moduels|optinal> < nginx|optional >
# if you only want to use the second param, you must set the type=""
# Demo
bash build.sh dev
bash build.sh dev reinstall
bash build.sh "" reinstall
# bash build.sh === bash build.sh pro

```

Default port: 7101

Open http://127.0.0.1:7101, you will see 'hi, this is aelf-block-api.'.

### 0.Dependencies

- 0.[aelf-block-scan](https://github.com/AElfProject/aelf-block-scan): 
Start up [aelf-block-scan](https://github.com/AElfProject/aelf-block-scan) at first.

- 1.Mysql: you can initialize the database through the [sql](https://github.com/AElfProject/aelf-block-scan/blob/master/aelf_test.sql) 
in [aelf-block-scan](https://github.com/AElfProject/aelf-block-scan)

- 2.NodeJS: You can see the JS dependencies in pakage.json, we use egg.js(Node.js & Koa).

### 1.Change  the Config

```bash
cp demo.config.js config.default.js
```

set your own config.keys & config.mysql

Warning About Mysql:

- Please do not use admin. Use the normal users without SUPER privilege.

Grant Demo

```bash
    CREATE USER 'normal_aelf'@'localhost' IDENTIFIED BY 'password';
    GRANT select, insert, update, delete on aelf_test.* TO 'normal_aelf'@'localhost';
```

### 2.Start the node server

try to use build.sh at first.

```bash
npm install

dev: npm run dev

pro: npm start
```

## About csrf-token & POST API

If you want test Post API.

You must set header x-csrf-token=(csrfToken in cookie).

```javascript
// for a javascript example
const csrf = document.cookie.match(/csrfToken=[^;]*/)[0].replace('csrfToken=', '');
fetch(`/block/api/address/transactions`, {
    credentials: 'include',
    method: 'POST',
    headers: {
        // About csrf token
        // csrf: https://github.com/pillarjs/understanding-csrf/blob/master/README_zh.md
        // csrf: https://www.ibm.com/developerworks/cn/web/1102_niugang_csrf/index.html
        'x-csrf-token': csrf,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}).then().catch();
```

## Docker

Now, the Repositories of test demo is in [docker/hzz780/aelf-block-api](https://cloud.docker.com/swarm/hzz780/repository/docker/hzz780/aelf-block-api/general)

### Demo

```bash
docker container run -p 7101:7101 -dit \
--name=aelf-block-apinodeali \
--mount type=bind,source=/Users/huangzongzhe/workspace/hoopox/aelf-web-docker/api/config.default.js,target=/app/config/config.default.js \
aelf-block-api:noalinode /bin/bash

docker exec a7db727219ae npm start
```

## Alinode

Register [aliyun](https://www.aliyun.com/product/nodejs)

Then, look at config/demo.config.js & config/plugin.js

## API DOCS

[postman](https://www.getpostman.com/collections/b97c94ea6f024360b7a7)

We use nginx when we dev, so you will see http://localhost:7000/block/api/address but not http://localhost:7101/api/address.

## Dev Suggestion

We advise you implement your own API like the example.

```javascript
// 1.
// The framework recommends that the Controller layer is responsible for processing request parameters(verification and transformation)
// from user's requests, then calls related business methods in Service, encapsulates and sends back business result:
// 1.retrieves parameters passed by HTTP.
// 2.verifies and assembles parameters.
// 3.calls the Service to handle business, if necessary,
//          transforms Service process results to satisfy user's requirement.
// 4.sends results back to user by HTTP.
// 框架推荐 Controller 层主要对用户的请求参数进行处理（校验、转换），然后调用对应的 service 方法处理业务，得到业务结果后封装并返回：
// 获取用户通过 HTTP 传递过来的请求参数。
// 校验、组装参数。
// 调用 Service 进行业务处理，必要时处理转换 Service 的返回结果，让它适应用户的需求。
// 通过 HTTP 将结果响应给用户。

// 2.
// give the params keysRule.

// Example, code snippets.
// controller/address.js
    async getTokens() {
        let ctx = this.ctx;

        // Not only param validate but also a detail param doc.
        // About 'paramater': https://github.com/node-modules/parameter
        const keysRule = {
            address: 'string',
            limit: {
                type: 'int',
                required: false,
                allowEmpty: true,
                max: 500,
                min: 0
            },
            page: {
                type: 'int',
                required: false,
                allowEmpty: true
            },
            order: {
                type: 'string',
                required: false,
                allowEmpty: true
            },
            nodes_info: {
                type: 'boolean',
                required: false,
                allowEmpty: true
            }
        };

        try {
            let {
                address,
                limit,
                page,
                order,
                nodes_info
            } = ctx.request.query;
            let options = {
                address,
                limit: limit ? parseInt(limit, 10) : 0,
                page: page ? parseInt(page, 10) : 0,
                order: order || 'DESC',
                nodes_info: nodes_info || false
            };
            ctx.validate(keysRule, options);
            let result = await ctx.service.address.getTokens(options);
            formatOutput(ctx, 'get', result);
        }
        catch (error) {
            formatOutput(ctx, 'error', error, 422);
        }
    }

// service/address.js
async getTokens(options) {
    // get the tokens information.
}
```