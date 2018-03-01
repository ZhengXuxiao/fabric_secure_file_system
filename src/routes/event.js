// setup fabric basic network
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

var config = {channel:"mychannel", order_addr:'grpc://localhost:7050', peer_addr:'grpc://localhost:7051', event_addr:'grpc://localhost:7053'};
var app_name = ["myapp", "keyExchange"];
var store_path = path.join(__dirname, "../../hfc-key-store");
var fabric_client = new Fabric_Client();
var event_hub = fabric_client.newEventHub();
event_hub.setPeerAddr(config.event_addr);
// create the key value store as default config
Fabric_Client.newDefaultKeyValueStore({ path: store_path }).then((state_store) => {
    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();
    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    return fabric_client.getUserContext('admin', true);
}).then((user_from_store) => {
    event_hub.connect();
    var promise = new Promise( (resolve, reject) => {
        event_hub.registerChaincodeEvent(app_name[1], 'requestSecret', function(ev) {
            console.log("catch requestSecret event", ev.payload.toString());
            // do something
        },
        function() {
            console.log("event listener stopped");
        }); 

        event_hub.registerChaincodeEvent(app_name[1], 'respondSecret', function(ev) {
            console.log("catch respondSecret event", ev.payload.toString());
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
