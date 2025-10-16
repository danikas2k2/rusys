#!/bin/bash

set -e

SERVER_USER="danikas2k2"
SERVER_IP="rusys.andriaus.com"

trap 'echo "❌ Setup failed!"; exit 1' ERR

echo "Setting up mongo replica set"

ssh "$SERVER_USER@$SERVER_IP" "
  docker exec rusys-db1 mongosh --eval 'rs.initiate({
    _id: \"rusys-rs\",
    members: [
      { _id: 0, host: \"rusys-db1\" },
      { _id: 1, host: \"rusys-db2\" },
      { _id: 2, host: \"rusys-db3\" }
    ]
  })'
"

echo "✅ Setup completed successfully!"
exit 0
