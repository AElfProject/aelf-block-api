# AElf Block API

## Quick Start

Please ensure your dependencies are ready.

If you meet some permission problem, please use 'sudo'.

```shell
bash build.sh < type|optional > < node_moduels|optinal >
// if you only want to use the second param, you must set the type=""
bash build.sh dev
bash build.sh dev reinstall
bash build.sh "" reinstall

bash build.sh === bash build.sh pro
```

Default port: 7101

### 0.Dependencies

1.Mysql: you can initialize the database through the [sql](https://github.com/AElfProject/aelf-block-scan/blob/master/aelf_test.sql) 
in [aelf-block-scan](https://github.com/AElfProject/aelf-block-scan)

2.[aelf-block-scan](https://github.com/AElfProject/aelf-block-scan): Running [aelf-block-scan](https://github.com/AElfProject/aelf-block-scan), you can get the data from the AElf chain by RPC.

3.NodeJS: You can see the JS dependencies in pakage.json, we use egg.js(Node.js & Koa).

### 1.Change  the Config

change config/config.default.js

set your own config.keys & config.mysql

### 2.Start the node server

npm install

dev: npm run dev

pro: npm start

## Docker

Now, the Repositories of test demo is in [docker/hzz780/aelf-block-api](https://cloud.docker.com/swarm/hzz780/repository/docker/hzz780/aelf-block-api/general)

#### Demo

```
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
