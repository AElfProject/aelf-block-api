# Quick Start
need Deploy aelf-block-scan at first.

npm install

change config/config.default.js

dev: npm run dev

pro: npm start

# Docker

Now, the Repositories of test demo is in [docker/hzz780/aelf-block-api](https://cloud.docker.com/swarm/hzz780/repository/docker/hzz780/aelf-block-api/general)

####Demo

```
docker container run -p 7101:7101 -dit \
--name=aelf-block-apinodeali \
--mount type=bind,source=/Users/huangzongzhe/workspace/hoopox/aelf-web-docker/api/config.default.js,target=/app/config/config.default.js \
aelf-block-api:noalinode /bin/bash

docker exec a7db727219ae npm start
```

# Alinode

Register [aliyun](https://www.aliyun.com/product/nodejs)

Then, look at config/demo.config.js & config/plugin.js

