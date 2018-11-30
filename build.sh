#!/bin/sh

cat << EOT

                _    _____ _  __       ____  _            _           _    ____ ___
               / \  | ____| |/ _|     | __ )| | ___   ___| | __      / \  |  _ \_ _|
              / _ \ |  _| | | |_ _____|  _ \| |/ _ \ / __| |/ /____ / _ \ | |_) | |
             / ___ \| |___| |  _|_____| |_) | | (_) | (__|   <_____/ ___ \|  __/| |
            /_/   \_\_____|_|_|       |____/|_|\___/ \___|_|\_\   /_/   \_\_|  |___|

EOT

git checkout package.json
git checkout package-lock.json

echo 'rf -rf node_modules ...'
rm -rf node_modules

git pull origin master

npm install

npm stop

npm start


