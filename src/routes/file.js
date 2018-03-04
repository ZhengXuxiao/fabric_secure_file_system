var express = require('express');
var router = express.Router();
var network = require('./setup.js');
var chaincode = require('./chaincode.js');
var multer = require('multer');
var upload = multer({dest: 'upload/'});

/* GET & POST invoke createFile and queryFileByPartialKey function in chaincode  */
router.route('/').get(function(req, res, next) {
    // GET /file
    // invoke queryFileByPartialKey
    // params: keyword, name, owner

    var _query = [];
    if (! req.body.name) var data = req.query;
    else var data = req.body;
    if (data.keyword.length > 0) _query.push(data.keyword);
    if (data.name.length > 0) _query.push(data.name);
    if (data.owner.length > 0) _query.push(data.owner);

    const request = {
        chaincodeId: network.clientList[req.session.user].app_name[0],
        fcn: 'queryFile',
        args: _query
    };
    return chaincode.query(req, res, next, request);

}).post(upload.single('file'), function(req, res, next) {
    // POST /file
    // invoke createFile
    // params: name, hash, keyword, summary
    if (! req.body.name) var data = req.query;
    else var data = req.body;

    var _query = [];
    _query.push(data.name);
    _query.push("hash");
    _query.push(data.keyword);
    _query.push(data.summary);

    var _txId = network.clientList[req.session.user].fabric_client.newTransactionID();

    const request = {
        chaincodeId: network.clientList[req.session.user].app_name[0],
        fcn: 'createFile',
        args: _query,
        chainId: network.clientList[req.session.user].config.channel,
        txId: _txId
    };
    return chaincode.invoke(req, res, next, request);

}).delete(function(req, res, next) {
    // DELETE /file
    // invoke deleteFile
    // params: keyword, name, owner

    if (! req.body.name) var data = req.query;
    else var data = req.body;
 
    var _query = [];
    _query.push(data.keyword);
    _query.push(data.name);
    _query.push(data.owner);

    var _txId = network.clientList[req.session.user].fabric_client.newTransactionID();

    const request = {
        chaincodeId: network.clientList[req.session.user].app_name[0],
        fcn: 'deleteFile',
        args: _query,
        chainId: network.clientList[req.session.user].config.channel,
        txId: _txId
    };
    return chaincode.invoke(req, res, next, request);
});

module.exports = router;
