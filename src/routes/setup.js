// setup fabric basic network
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

var Network = {
    config: {channel:"mychannel", grpc:'grpc://localhost:7051'},
    app_name: "myapp",
    fabric_client: null,
    channel: null,
    peer: null,
    store_path: path.join(__dirname, "../../hfc-key-store"),
    user: null,

    // init network
    init: function() {
        console.log("initiating the fabric network");
        // init basic network config
        this.fabric_client = new Fabric_Client();
        this.channel = this.fabric_client.newChannel(this.config.channel);
        this.peer = this.fabric_client.newPeer(this.config.grpc);
        this.channel.addPeer(this.peer);
        var uname = "user1";
        console.log("store path: ", this.store_path);

        // create the key value store as default config
        Fabric_Client.newDefaultKeyValueStore({ path: this.store_path }).then((state_store) => {
            this.fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: this.store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            this.fabric_client.setCryptoSuite(crypto_suite);
            console.log("fabric network initialization done");
        });
    }
}

module.exports = Network;
