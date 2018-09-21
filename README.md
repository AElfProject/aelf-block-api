# aelf-block-api

## Dependences

mysql

need Deploy aelf-block-scan at first.

## QuickStart

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7101/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org

### How use Docker

Now, the Repositories of test demo is in [docker/hzz780/aelf-block-api](https://cloud.docker.com/swarm/hzz780/repository/docker/hzz780/aelf-block-api/general)

####Demo

```
docker container run -p 7101:7101 -dit \
--name=aelf-block-apinodeali \
--mount type=bind,source=/Users/huangzongzhe/workspace/hoopox/aelf-web-docker/api/config.default.js,target=/app/config/config.default.js \
aelf-block-api:noalinode /bin/bash

docker exec a7db727219ae npm start
```

#### Use Alinode

Register [aliyun](https://www.aliyun.com/product/nodejs)

Then, look at config/demo.config.js & config/plugin.js

