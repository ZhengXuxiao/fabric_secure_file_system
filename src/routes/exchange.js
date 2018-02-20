var express = require('express');
var router = express.Router();
var network = require('./setup.js');
var chaincode = require('./chaincode.js');

/* GET & POST invoke createFile and queryFileByPartialKey function in chaincode  */
router.route('/').get(function(req, res, next) {
    // GET /exchange
    // invoke respondSecret
    // params: tx_id, secret

    var _query = [];
    _query.push(req.query.tx_id);
    _query.push(req.query.secret);

    var _txId = network.fabric_client.newTransactionID();

    const request = {
        chaincodeId: network.app_name[1],
        fcn: 'respondSecret',
        args: _query,
        chainId: network.config.channal,
        txId: _txId
    };
    return chaincode.invoke(req, res, next, request);

}).post(function(req, res, next) {
    // POST /exchange
    // invoke requestSecret
    // params: keyword, name, owner

    var _query = [];
    _query.push(req.query.keyword);
    _query.push(req.query.name);
    _query.push(req.query.owner);

    var _txId = network.fabric_client.newTransactionID();

    const request = {
        chaincodeId: network.app_name[1],
        fcn: 'requestSecret',
        args: _query,
        chainId: network.config.channel,
        txId: _txId
    };
    return chaincode.invoke(req, res, next, request);

}).delete(function(req, res, next) {
    // DELETE /exchange
    // invoke confirmSecret
    // params: tx_id

    var _query = [];
    _query.push(req.query.tx_id);

    var _txId = network.fabric_client.newTransactionID();

    const request = {
        chaincodeId: network.app_name[1],
        fcn: 'confirmSecret',
        args: _query,
        chainId: network.config.channel,
        txId: _txId
    };
    return chaincode.invoke(req, res, next, request);
});

module.exports = router;