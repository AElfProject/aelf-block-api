# AElf Block API

## Quick Start

Please ensure your dependencies are ready.

Default port: `7101`

Open `http://127.0.0.1:7101`, you will see 'hi, this is aelf-block-api.'.

### 0.Dependencies

- 1.[aelf-scan-mysql](https://github.com/AElfProject/aelf-scan-mysql):
Start up [aelf-scan-mysql](https://github.com/AElfProject/aelf-scan-mysql) at first. There are mysql and redis services in this project
- 2.NodeJS: You can see the JS dependencies in package.json, we use egg.js(Node.js & Koa).
- 3. Redis, you need a redis

### 1.Change the Config

set your own configs in `.env`

include: `sql`, `endpoint` and `side chain APIs`

1. sql: mysql service in `aelf-scan-mysql`
2. endpoint: chain endpoint
3. side chain APIs: other chains' `aelf-block-api` services URLs

And Redis config in `config/config.default.js`

Warning About Mysql:

- Please do not use root. Use the normal users without SUPER privilege.

Grant Demo

```bash
    CREATE USER 'normal_aelf'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
    GRANT select, insert, update, delete on aelf_test.* TO 'normal_aelf'@'localhost';
```

### 2.Start the node server

try to use build.sh at first.

```bash
npm install

# for local development
npm run dev
# for production
npm start
# for shutdown in production environment
npm stop
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

## API DOCS

You can get the docs in the folder ./postman

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
    async function getTokens() {
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
async function getTokens(options) {
    // get the tokens information.
}
```
