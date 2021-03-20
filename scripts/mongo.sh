#!/bin/sh

set -e

NAME=ROLLUPSCAN_MONGO

docker stop $NAME || true
docker rm $NAME || true

docker run -d --name $NAME -p 27017:27017 mongo:4.2
