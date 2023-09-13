var express = require('express')
    , router = express.Router()
    , resEvents = require('../commons/events')
    , BaseError = require('../commons/BaseError')
    , _ = require('lodash')
    , Utils = require('../util/util')
    , constants = require('../commons/constants')
    , logger = require('../commons/logger')
    , baseService = require('../commons/base.service')
    , userService = require('../service/user.service');

router.post('/sponsor/tree/:sponsorId', function(req, res, next) {
    var sponsorId = req.params.sponsorId;
    logger.info('Getting sponsor tree by sponsorId for admin : ', sponsorId);
    
});

module.exports = router;
