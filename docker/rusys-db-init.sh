#!/bin/bash
docker exec rusys-db1 mongosh --port 30201 --eval 'rs.initiate({
  _id: "rusys-rs",
  members: [
    { _id: 0, host: "rusys-db1:30201" },
    { _id: 1, host: "rusys-db2:30202" },
    { _id: 2, host: "rusys-db3:30203" }
  ]
})'
