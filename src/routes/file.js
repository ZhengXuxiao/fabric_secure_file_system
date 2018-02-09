var express = require('express');
var router = express.Router();
var network = require('./setup.js')

/* GET & POST invoke createFile and queryFileByPartialKey function in chaincode  */
router.route('/').get(function(req, res, next) {
    // GET /file
    // invoke queryFileByPartialKey
    // params: keyword, name, owner

    var client = network.fabric_client;
    // check user
    if (! network.user) {
        res.send({success:false, message:"please login in first"});
    }

    var _query = [];
    if (req.query.keyword.length > 0) _query.push(req.query.keyword);
    if (req.query.name.length > 0) _query.push(req.query.name);
    if (req.query.owner.length > 0) _query.push(req.query.owner);

    const request = {
        chaincodeId: network.app_name,
        fcn: 'queryFileByPartialKey',
        args: _query
    };
    console.log(_query);

    network.channel.queryByChaincode(request).then((query_responses) => {
        if (query_responses && query_responses.length == 1) {
            if (query_responses[0] instanceof Error) {
                res.send({success:false, message:query_responses[0]});
            } else {
                res.send({success:true, message:query_responses[0].toString()});
            }
        } else {
            res.send({success:false, message:"no payload in response"});
        }
    }).catch((err) => {
        res.send({success:false, message:err});
    });
}).post(function(req, res, next) {
    // POST /file
    // invoke createFile
    // params: name, hash, keyword, summary

    var client = network.fabric_client;
    // check user
    if (! network.user) {
        res.send({success:false, message:"please login in first"});
    }

    var _query = [];
    _query.push(req.query.name);
    _query.push(req.query.hash);
    _query.push(req.query.keyword);
    _query.push(req.query.summary);

    var _txId = client.newTransactionID();

    console.log(_query);
    const request = {
        chaincodeId: network.app_name,
        fcn: 'createFile',
        args: _query,
        chainId: network.config.channel,
        txId: _txId
    };

    network.channel.sendTransactionProposal(request).then((result) => {
        res.send({success:true, message:result});
    }).catch((err) => {
        res.send({success:false, message:err});
    });
}).delete(function(req, res, next) {
    // DELETE /file
    // invoke deleteFile
    // params: keyword, name, owner

    var client = network.fabric_client;
    // check user
    if (! network.user) {
        res.send({success:false, message:"please login in first"});
    }

    var _query = [];
    _query.push(req.query.keyword);
    _query.push(req.query.name);
    _query.push(req.query.owner);

    var _txId = client.newTransactionID();

    const request = {
        chaincodeId: network.app_name,
        fcn: 'deleteFile',
        args: _query,
        chainId: network.config.channel,
        txId: _txId
    };

    network.channel.sendTransactionProposal(request).then((result) => {
        res.send({success:true, message:result});
    }).catch((err) => {
        res.send({success:false, message:err});
    });

})

module.exports = router;
