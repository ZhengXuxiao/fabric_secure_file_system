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
        return res.send({success:false, message:"please login in first"});
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
                return res.send({success:false, message:query_responses[0]});
            } else {
                return res.send({success:true, message:query_responses[0].toString()});
            }
        } else {
            return res.send({success:false, message:"no payload in response"});
        }
    }).catch((err) => {
        return res.send({success:false, message:err});
    });
}).post(function(req, res, next) {
    // POST /file
    // invoke createFile
    // params: name, hash, keyword, summary

    // check user
    if (! network.user) {
        return res.send({success:false, message:"please login in first"});
    }

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
    return invoke_chaincode(req, res, next, request);
}).delete(function(req, res, next) {
    // DELETE /file
    // invoke deleteFile
    // params: keyword, name, owner

    var client = network.fabric_client;
    // check user
    if (! network.user) {
        return res.send({success:false, message:"please login in first"});
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
    return invoke_chaincode(req, res, next, request);
});


function invoke_chaincode(req, res, next, request) {
    network.channel.sendTransactionProposal(request).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
            isProposalGood = true;
        } else {
            return res.send({success:false, message:"Transaction proposal was bad"});
        }

        // proposal is fine. now create a request
        var tx_request = {
            proposalResponses: proposalResponses,
            proposal: proposal
        };
        // init an transaction listener and set a timeout of 30 sec
        var transaction_id_string = request.txId.getTransactionID();
        var promises = [];
        // send tx here
        var sendPromise = network.channel.sendTransaction(tx_request);
        promises.push(sendPromise);
        // get an event hub
        let event_hub = network.event_hub;
        let txPromise = new Promise((resolve, reject) => {
            let handle = setTimeout(() => {
                event_hub.disconnect();
                resolve({event_status:'TIMEOUT'});
            }, 3000);  // reject tx after 30 sec
            event_hub.connect();
            event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                // clear
                clearTimeout(handle);
                event_hub.unregisterTxEvent(transaction_id_string);
                event_hub.disconnect();

                var return_status = {event_status:code, tx_id:transaction_id_string};
                if (code != 'VALID') {
                    resolve(return_status);
                } else {
                    resolve(return_status);
                    // transaction was successfully commited on peer
                }
            }, (err) => {
                console.log("event error");
                reject(new Error("something wrong in event hub: "+err));
            });
        });
        promises.push(txPromise);
        return Promise.all(promises);
    }).then((results) => {
        if (results && results[0] && results[0].status === 'SUCCESS') {
            // pass
        } else {
            return res.send({success:false, message:"Fail to order the transaction"});
        }
        
        if (results && results[1] && results[1].event_status === 'VALID') {
            // pass
        } else {
            return res.send({success:false, message:"Fail to commit transaction to the ledger"});
        }

        return res.send({success:true, tx_id:results[1].tx_id});
    }).catch((err) => {
        console.log(4);
        res.send({success:false, message:"Fail to invoke the chaincode"});
    });

}

module.exports = router;
