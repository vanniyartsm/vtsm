var express = require('express')
    , router = express.Router()
    , resEvents = require('../commons/events')
    , BaseError = require('../commons/BaseError')
    , _ = require('lodash')
    , Utils = require('../util/util')
    , constants = require('../commons/constants')
    , logger = require('../commons/logger')
    , baseService = require('../commons/base.service')
    , generalService = require('../service/general.service');

router.post('/support', function(req, res, next) {
    logger.info('Entry /support');
    var supportJson = req.body;
    var user = req.session.user;
    if (user) {
        supportJson.user = {};
        supportJson.user.userId = user._id;
        supportJson.user.userName = user.userName;
        supportJson.user.sponsorId = user.sponsorId;
        generalService.saveSupport(supportJson, function(err, support) {
            if (err) {
                logger.debug('Save support service : ', err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.SUPPORT_VALIDATION, '', constants.SUPPORT_VALIDATION_MSG, err.message, 500));
                resEvents.emit('ErrorJsonResponse', req, res, baseError);
            } else {
                res.status(constants.HTTP_OK).send({
                    status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Submitted"),
                    data: support});
            }
        });
    } else {
        res.status(constants.HTTP_OK).send({
            status: baseService.getStatus(req, res, constants.HTTP_BAD_REQUEST, "User Not Found"),
            data: {}});
    }
});

module.exports = router;
