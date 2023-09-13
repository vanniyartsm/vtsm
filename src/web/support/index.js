var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , logout = require('express-passport-logout')
    , logger = require('../../commons/logger')
    , BaseError = require('../../commons/BaseError')
    , Utils = require('../..//util/util')
    , constants = require('../../commons/constants')
    , renderConstants = require('../../commons/render.constants')
    , resEvents = require('../../commons/events')
    , genericService = require('../../service/general.service')
    , baseService = require('../../commons/base.service')
    , request = require('request')
    , moment = require('moment');
const uuidv1 = require('uuid/v1');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(constants.SEND_GRID_MAIL_API_KEY);
var liveBlockchain = global.config.system.liveBlockchain;

router.get('/details', function(req, res, next) {
    logger.info('Get Support details by User - support/index.js /details');
    var user = req.session.user;

    logger.info('Get Support Details');

    var user = req.session.user;
    logger.info('Get Support Details User : ', JSON.stringify(user));
    if (user) {
        logger.info('Query genericService');
        genericService.getAllSupportsByUser(user._id, function(err, supports) {
            if (err) {
                logger.info('Error while getting supports : ' + JSON.stringify(err));
            }
            res.render(renderConstants.SUPPORT_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, supports: supports, moment: moment}); 
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/details/:supportId/:supportTicket', function(req, res, next) {
    logger.info('Get Support details by User - support/index.js /details/supportTicket');
    var user = req.session.user;

    logger.info('Get Support Details User : ', JSON.stringify(user));
    if (user) {
        logger.info('Query genericService');
        var supportId = req.params.supportId;
        var supportTicket = req.params.supportTicket;

        genericService.getSupportById(supportId, function(err, support) {
            genericService.getSupportsDetails(supportTicket, function(err, supports) {
                if (err) {
                    logger.info('Error while getting supports by supportTicket : ' + JSON.stringify(err));
                }
                console.info('sending supports : ', supports);
                res.render(renderConstants.SUPPORT_DETAILS_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, user: user, supports: supports, support: support, moment: moment}); 
            });
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.post('/details/update', function(req, res, next) {
    logger.info('Get Support details by User - support/index.js /details/supportTicket');
    var user = req.session.user;
    logger.info('Get Support Details User : ', JSON.stringify(user));
    if (user) {
        var supportJson = req.body;
        supportJson.user = user;
        genericService.getSupportById(supportJson.supportTicketId, function(err, support) {
            genericService.updateSupport(supportJson, support, function (err, result) {
                genericService.getSupportsDetails(supportJson.supportTicketNo, function(err, supports) {
                    if (err) {
                        logger.info('Error while getting supports by supportTicket : ' + JSON.stringify(err));
                    }
                    res.render(renderConstants.SUPPORT_DETAILS_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, user: user, supports: supports, support: support, moment: moment}); 
                });
            })
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.post('/', function(req, res, next) {
    logger.info('Get Support details by User - support/index.js /');
    var user = req.session.user;
    logger.info('Create Support');
    var supportJson = req.body;

    if (user) {
        genericService.getSupportById(supportId, function(err, support) {
            genericService.updateSupport(supportJson, (err, result) => {
                genericService.getSupportsDetails(supportTicket, function(err, supports) {
                    if (err) {
                        logger.info('Error while saving support : ' + JSON.stringify(err));
                    } else {
                        var baseMessage = new BaseError(Utils.buildErrorResponseWithType(constants.SUPPORT_UPDATED, '', constants.SUPPORT_UPDATED_MSG, constants.SUPPORT_UPDATED_MSG, 200, constants.ALERT_MESSAGE_SUCCESS));
                        res.render(renderConstants.SUPPORT_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, support: support, moment: moment, err : baseMessage});
                    }
                });
            });
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/history', function(req, res, next) {
    console.info('history');

    var user = req.session.user;    
});

module.exports = router;