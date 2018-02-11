var express = require('express');
var router = express.Router();
var network = require('./setup.js');
var chaincode = require('./chaincode.js');

/* GET & POST invoke createFile and queryFileByPartialKey function in chaincode  */
router.route('/').get(function(req, res, next) {
    // GET /file
    // invoke queryFileByPartialKey
    // params: keyword, name, owner

    var _query = [];
    if (req.query.keyword.length > 0) _query.push(req.query.keyword);
    if (req.query.name.length > 0) _query.push(req.query.name);
    if (req.query.owner.length > 0) _query.push(req.query.owner);

    const request = {
        chaincodeId: network.app_name,
        fcn: 'queryFileByPartialKey',
        args: _query
    };
    return chaincode.query(req, res, next, request);

}).post(function(req, res, next) {
    // POST /file
    // invoke createFile
    // params: name, hash, keyword, summary

    var _query = [];
    _query.push(req.query.name);
    _query.push(req.query.hash);
    _query.push(req.query.keyword);
    _query.push(req.query.summary);

    var _txId = network.fabric_client.newTransactionID();

    const request = {
        chaincodeId: network.app_name,
        fcn: 'createFile',
        args: _query,
        chainId: network.config.channel,
        txId: _txId
    };
    return chaincode.invoke(req, res, next, request);

}).delete(function(req, res, next) {
    // DELETE /file
    // invoke deleteFile
    // params: keyword, name, owner

    var _query = [];
    _query.push(req.query.keyword);
    _query.push(req.query.name);
    _query.push(req.query.owner);

    var _txId = network.fabric_client.newTransactionID();

    const request = {
        chaincodeId: network.app_name,
        fcn: 'deleteFile',
        args: _query,
        chainId: network.config.channel,
        txId: _txId
    };
    return chaincode.invoke(req, res, next, request);
});

module.exports = router;
