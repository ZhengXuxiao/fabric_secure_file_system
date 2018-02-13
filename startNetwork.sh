#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
LANGUAGE="golang"
BASE_PATH=/opt/gopath/src/github.com

# clean the keystore
rm -rf ./hfc-key-store

# stop and delete all containers
# please check whether you have other containers in use
# docker rm -f $(docker ps -aq)
docker network prune


cd ./basic-network
# setup channels and containers
./start.sh
docker-compose -f ./docker-compose.yml up -d cli


# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli mkdir $BASE_PATH/myapp

