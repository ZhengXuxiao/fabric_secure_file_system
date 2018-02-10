# RESTful API for fabric sample chaincode
## Introduction
本项目使用hyperledger fabric 1.0.5
搭建fabric基本网络（单节点），使用golang编写示例chaincode，使用nodejs SDK以及express搭建RESTful API.  
参考了/fabric-samples/basic-network && /fabric-samples/fabcar   
测试基于fabric 1.0.5 以及basic-network
## Dependency
* npm & node
* docker & docker-compose
* For other prerequisites please view [fabric Doc](http://hyperledger-fabric-doc.readthedocs.io/en/latest/prereqs.html)
## Get Started
* Download fabric images
[view the Doc](http://hyperledger-fabric-doc.readthedocs.io/en/latest/samples.html#binaries)
* Clear outdated containers and images
```shell
./clear.sh
```
warning: 该操作会删除所有docker container。或者可以手动删除fabric container以及旧的chaincode image.
* Setup fabric network
```shell
./startNetwork.sh
```
* Setup chaincode
```shell
./startChaincode.sh
```
chaincode存放在./chaincode中，使用golang编写。
* Install nodejs packages
```shell
npm install
```
* Resgister at least one user first
```shell
# register an admin user
node enrollAdmin.js
# register a user named 'user1'. The name can be edited in the script
node registerUser.js
```
* Run express server as a RESTful API
```shell
npm run dev
# listen on port 3000
```
## Usage
### login
POST http://hostname:3000/users/login  
params: username  
e.g.
```
POST http://127.0.0.1:3000/users/login?username=user1
Expected result:
{
    "success": true,
    "username": "user1"
}
```
### logout
POST http://hostname:3000/users/logout
### create a file
POST http://hostname:3000/file  
params: name, hash, keyword, summary  
e.g.  
```
POST http://127.0.0.1:3000/file?name=name1&hash=hash1&keyword=key1&summary=sum1
Expected result:
{"success":true,"tx_id":"cded19e5da0c61854c9049a27001ac5ee757f3bc67f84b2e1fbd9e494884e66b"}
```
File object has another field: owner  
owner = creator of the transaction  
### delete a file
DELETE http://hostname:3000/file  
params: keyword, name, owner  
chaincode 将检查 transaction creator's cretificate. 如果creator和file.owner不符合，操作将失败。
e.g.  
```
POST http://127.0.0.1:3000/file?keyword=key1&name=name1&owner=user1
Expexted result:
{"success":true,"tx_id":"3d72f82dcadfd71082caf2d268dccc80d95addd58e72b342ae71dd359d179468"}
```
### Query files
GET http://hostname:3000/file  
params: keyword, name, owner  
可以只提供keyword，则查找符合该keyword的file。  
同理可以提供前两个参数，或者提供全部三个参数将精确查找一个文件  
leveldb限制下暂时如此处理  
e.g.  
```
GET http://127.0.0.1:3000/file?keyword=key1&name=&owner=
Expected result:
{"success":true,"message":"[{\"Key\":{\"objectType\":File\", \"attributes\":[\"key1\", \"name1\",\"user1\"]},\"Record\":{\"hash\":\"hash1\",\"keyword\":\"key1\",\"name\":\"name1\",\"owner\":\"user1\",\"summary\":\"sum1\"}},
{\"Key\":{\"objectType\":File\",\"attributes\":[\"key1\", \"name2\", \"user1\"]},\"Record\":{\"hash\":\"hash2\",\"keyword\":\"key1\",\"name\":\"name2\",\"owner\":\"user1\",\"summary\":\"sum2\"}}]"}
```
### Other considerations
如果使用的fabric网络不同，请修改./src/routes/setup.js
```js
var Network = {
    config: {channel:"mychannel", order_addr:'grpc://localhost:7050', peer_addr:'grpc://localhost:7051', event_addr:'grpc://localhost:7053'},
    app_name: "myapp",
    fabric_client: null,
    channel: null,
    peer: null,
    store_path: path.join(__dirname, "../../hfc-key-store"),
    user: null,
    order: null,
    event_hub: null,
...
```
## TODO list
* query all files function. will come soon.
* chaincode event listener
* key exchange and privacy protection
* relational database implemented in chaincode
