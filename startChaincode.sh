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
CC_SRC_PATH=github.com/myapp
NAME=myapp

# docker rm dev-peer0.org1.example.com-"$NAME"-1.0

cd /home/zqz/Documents/fabric-samples/myapp/
docker cp ./chaincode/myapp.go cli:$BASE_PATH/myapp/myapp.go

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n $NAME -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n $NAME -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 10

printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"
