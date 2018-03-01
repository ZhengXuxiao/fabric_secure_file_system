var express = require('express');
var router = express.Router();
var network = require('./setup');

/* POST LOGIN */
router.post('/login', function(req, res, next) {
    var uname = req.query.username;
    req.session.user = uname;
    network.addClient(uname);
    if (typeof network.clientList[req.session.user] === 'undefined') {
        req.session.user = "";
        res.send({success: false, message: "login failed. If it is your first time ti login in, please try again later."});
    } else {
        res.send({success: true, username: uname});
    }
});

/* POST LOGOUT */
router.post('/logout', function(req, res, next) {
    req.session.user = "";
    res.sendStatus(200);
});

module.exports = router;
