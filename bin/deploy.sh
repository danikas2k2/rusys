#!/bin/bash

set -e

SERVER_USER="danikas2k2"
SERVER_HOST="rusys.andriaus.com"
REMOTE_PATH="/volume1/docker/rusys-app"



trap 'echo "❌ Deployment failed!"; exit 1' ERR

VERSION=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --version) VERSION="$2"; shift ;;
    *) echo "❌ Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

if [[ -z "$VERSION" ]]; then
  echo "❌ Error: --version argument is required!"
  exit 1
fi



echo "Deploying version: $VERSION"

# 1. Update compose.yaml with version
echo "Updating compose.yaml with version $VERSION..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/APP_VERSION: \".*\"/APP_VERSION: \"$VERSION\"/" ./docker/compose.yaml
else
  sed -i "s/APP_VERSION: \".*\"/APP_VERSION: \"$VERSION\"/" ./docker/compose.yaml
fi

# 2. SSH: Stop the current project (with sudo)
echo "Stopping current rusys-app containers..."
ssh "$SERVER_USER@$SERVER_HOST" "
  cd $REMOTE_PATH &&
  sudo docker-compose down
"

# 3. SCP: Upload new dist/ and docker files
echo "Uploading new files to server..."
rsync -avz --delete ./dist/ "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/dist/"
rsync -avz ./docker/compose.yaml "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/compose.yaml"
rsync -avz ./docker/Dockerfile "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/Dockerfile"

# 4. SSH: Build and start the project (with sudo)
echo "Building and starting rusys-app containers..."
ssh "$SERVER_USER@$SERVER_HOST" "
  cd $REMOTE_PATH &&
  sudo docker-compose build &&
  sudo docker-compose up -d
"

echo "✅ Deployment completed successfully!"
exit 0
