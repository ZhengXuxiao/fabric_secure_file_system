// setup fabric basic network
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var network = require('./setup');

var fabric_client = new Fabric_Client();
var event_hub = fabric_client.newEventHub();
event_hub.setPeerAddr(network.config.event_addr);
// create the key value store as default config
Fabric_Client.newDefaultKeyValueStore({ path: network.store_path }).then((state_store) => {
    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();
    var crypto_store = Fabric_Client.newCryptoKeyStore({path: network.store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    return fabric_client.getUserContext('admin', true);
}).then((user_from_store) => {
    event_hub.connect();
    var promise = new Promise( (resolve, reject) => {
        event_hub.registerChaincodeEvent(network.app_name, 'createFile', function(ev) {
            console.log("catch createFile event", ev);
            // do something
        },
        function() {
            console.log("event listener stopped");
        }); 

        event_hub.registerChaincodeEvent(network.app_name, 'deleteFile', function(ev) {
            console.log("catch deleteFile event", ev);
            // do something
        },
        function() {
            console.log("event listener stopped");
        });
    });
});

var event_listener = {

};

module.exports = event_listener;
