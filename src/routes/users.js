var express = require('express');
var router = express.Router();
var network = require('./setup');

/* POST LOGIN */
router.post('/login', function(req, res, next) {
    var uname = req.query.username;
    var client = network.fabric_client;
    client.getUserContext(uname, true).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            console.log(uname+" login");
            network.user = user_from_store;
            //res.sendStatus(200);
            res.send({success: true, username: uname});
        } else {
            //res.sendStatus(404);
            res.send({success: false, username: uname});
        }
    });
});

/* POST LOGOUT */
router.post('/logout', function(req, res, next) {
    network.user = null;
    res.sendStatus(200);
});

module.exports = router;
