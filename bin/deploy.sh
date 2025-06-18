#!/bin/bash

set -e

SERVER_USER="danikas2k2"
SERVER_HOST="rusys.andriaus.com"
SERVER_PORT="2202"
REMOTE_PATH="/volume1/docker/rusys-app"

trap 'echo "❌ Deployment failed!"; exit 1' ERR

echo "Uploading new files to server..."
rsync -avz -e "ssh -p $SERVER_PORT" --delete ./dist/ "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/dist/"
rsync -avz -e "ssh -p $SERVER_PORT" ./docker/compose.yaml "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/compose.yaml"
rsync -avz -e "ssh -p $SERVER_PORT" ./docker/Dockerfile "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/Dockerfile"

echo "Building and restarting changed containers..."
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "
  cd $REMOTE_PATH &&
  sudo docker-compose up -d --build
"

echo "✅ Deployment completed successfully!"
exit 0
