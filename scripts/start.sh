#!/bin/sh

set -e

CONTAINER_NAME=guard_backend

docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

docker run \
  --name $CONTAINER_NAME \
  -d \
  --rm \
  -p 4001:4000 \
  -v ${PWD}/.env:/src/.env \
  $(docker build . -q)
