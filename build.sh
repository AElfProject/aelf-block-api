#!/bin/bash

cat << EOT

                _    _____ _  __       ____  _            _           _    ____ ___
               / \  | ____| |/ _|     | __ )| | ___   ___| | __      / \  |  _ \_ _|
              / _ \ |  _| | | |_ _____|  _ \| |/ _ \ / __| |/ /____ / _ \ | |_) | |
             / ___ \| |___| |  _|_____| |_) | | (_) | (__|   <_____/ ___ \|  __/| |
            /_/   \_\_____|_|_|       |____/|_|\___/ \___|_|\_\   /_/   \_\_|  |___|

EOT

#当变量a为null或为空字符串时则var=b
start_mode=${1:-'production'}
node_modules_action=${2:-'default'}
echo ${node_modules_action} ${start_mode}

git checkout package-lock.json

git pull && echo 'git pull done'

if [ ${node_modules_action} = 'reinstall' ]
then
    echo 'npm install'
    npm install && echo 'install done'
    sleep 3
    npm install && echo 'install check done'
    sleep 3
fi

if [ ${start_mode} = 'dev' ]
then
    npm run dev
    echo 'npm run dev'
else
    npm stop && npm start
    echo 'npm stop && npm start'
fi


