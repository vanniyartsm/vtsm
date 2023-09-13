/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , resEvents = require('../commons/events')
    , Utils = require('../util/util')
    , BaseError = require('../commons/BaseError')
    , _ = require('lodash')
    , async = require('async')
    , constants = require('../commons/constants')
    , logger = require('../commons/logger')
    , rTracer = require('cls-rtracer')
    , baseService = require('../commons/base.service')
    , walletServiceImpl = require('./impl/wallet.service.impl')
    , pointsServiceImpl = require('./impl/points.service.impl')
    , userServiceImpl = require('./impl/user.service.impl');

const uuidv1 = require('uuid/v1');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(constants.SEND_GRID_MAIL_API_KEY);

exports.initiatePoints = function(req, res, next) {

    // initiate a new points
    var pointsJson = req.body;
    var user = req.session.user;
    //console.info('initiatePoints pointsJson = ', pointsJson);
    console.info('pointsJson = ', pointsJson);
    console.info('pointsJson null = ', (pointsJson.value == null));
    console.info('pointsJson undefined = ', (pointsJson.value == undefined));
    var canInitiate = true;

    if (_.isEmpty(pointsJson)) {
        logger.debug(constants.POINTS_OBJ_EMPTY_MSG);
        canInitiate = false;
        var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_OBJ_EMPTY, '', constants.POINTS_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    } 
    
    if (pointsJson.value == null) {
        logger.debug('Value is empty : ', constants.VALUE_OBJ_EMPTY_MSG);
        canInitiate = false;
        var baseError = new BaseError(Utils.buildErrorResponse(constants.VALUE_OBJ_EMPTY, '', constants.VALUE_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }
    
    if (pointsJson.points == null) {
        logger.debug('Points empty : ', constants.POINTS_OBJ_EMPTY_MSG);
        canInitiate = false;
        var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_OBJ_EMPTY, '', constants.POINTS_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }
    logger.info('btc purchase initiated by ' + user.userName);

    if (canInitiate) {
        pointsServiceImpl.initiatePoints(pointsJson, function (err, points) {
            if (err) {
                logger.debug('err while initiating btc ', err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
                resEvents.emit('ErrorJsonResponse', req, res, baseError);
            }

            baseService.sendPointsInitiatedMail(user, pointsJson);
            logger.info('btc purchase initiated successfully '+ JSON.stringify(pointsJson));
            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Initiated"),
                data: points});
        });
    }
};

exports.updatePoints = function(req, res, next) {

    // initiate a new points
    var pointsJson = req.body;
    
    console.info('update pointsJson = ', pointsJson);

    if (_.isEmpty(pointsJson)) {
        logger.debug(constants.POINTS_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_OBJ_EMPTY, '', constants.POINTS_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    pointsServiceImpl.updatePoints(pointsJson, function (err, points) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        }

        res.status(constants.HTTP_OK).send({
            status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Initiated"),
            data: points});
    });
};

exports.getPointsByUserId = function(userId, callback) {

    logger.info('Getting points by user id : '+ userId);

    if (_.isEmpty(userId)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        callback(baseError, null);
    }

    pointsServiceImpl.getPointsByUserId(userId, function (err, blockchainInitiated) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            callback(baseError, blockchainInitiated);
        }

        callback(null, blockchainInitiated);
    });
};

exports.getAllPendingBlockchainInitiated = function(callback) {
    const requestId = rTracer.id()
    logger.info('Getting all pending blockchain initiated');

    pointsServiceImpl.getAllPendingBlockchainInitiated( function (err, blockchainInitiated) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            callback(baseError, blockchainInitiated);
        }

        callback(null, blockchainInitiated);
    });
};

exports.getAllRequestedBlockchainInitiated = function(callback) {

    logger.info('Getting all requested blockchain initiated');

    pointsServiceImpl.getAllRequestedBlockchainInitiated( function (err, blockchainInitiated) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            callback(baseError, blockchainInitiated);
        }

        callback(null, blockchainInitiated);
    });
};

exports.getBalance = function(balanceJson, callback) {

    logger.info('Getting all requested blockchain initiated');

    pointsServiceImpl.getBalance(balanceJson, function (err, balance) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            callback(baseError, balance);
        }

        callback(err, balance);
    });
};

exports.getUnitsByUserId = function(userId, callback) {

    console.info('getUnitsByUserId service userId = ', userId);

    if (_.isEmpty(userId)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        callback(baseError, null);
    }

    pointsServiceImpl.getUnitsByUserId(userId, function (err, purchaseUnits) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            callback(baseError, purchaseUnits);
        }

        callback(null, purchaseUnits);
    });
};

exports.getTransferPointsByUserId = function(userId, callback) {

    console.info('getTransferPointsByUserId service userId = ', userId);

    if (_.isEmpty(userId)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        callback(baseError, null);
    }

    pointsServiceImpl.getTransferPointsByUserId(userId, function (err, points) {
        console.info('points ===== ', points)
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            callback(baseError, points);
        }

        callback(null, points);
    });
};

exports.getTransfersByUserId = function(userId, callback) {

    console.info('getTransfersByUserId service userId = ', userId);

    if (_.isEmpty(userId)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        callback(baseError, null);
    }

    pointsServiceImpl.getTransfersByUserId(userId, function (err, transfers) {
        console.info('err ===== ', err)
        console.info('transfers ===== ', transfers)
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            callback(baseError, transfers);
        }

        callback(null, transfers);
    });
};

exports.initiateRequest = function(id, callback) {

    console.info('initiateRequest service id = ', id);

    if (_.isEmpty(id)) {
        var baseError = new BaseError(Utils.buildErrorResponse(constants.REQUEST_POINTS_FAILED, '', constants.REQUEST_POINTS_FAILED, err.message, 500));
        callback(baseError, null);
    }

    pointsServiceImpl.initiateRequest(id, function (err, blockchainInitiated) {
        if (err) {
            console.info('err = ', err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.REQUEST_POINTS_FAILED, '', constants.REQUEST_POINTS_FAILED_MSG, err.message, 500));
            callback(baseError, blockchainInitiated);
        }

        callback(null, blockchainInitiated);
    });
};

exports.initiateCryptoRequest = function(param, callback) {

    if (_.isEmpty(param.id)) {
        var baseError = new BaseError(Utils.buildErrorResponse(constants.REQUEST_POINTS_FAILED, '', constants.REQUEST_POINTS_FAILED, err.message, 500));
        callback(baseError, null);
    }

    pointsServiceImpl.initiateCryptoRequest(param, function (err, blockchainInitiated) {
        if (err) {
            logger.info('err = ', err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.REQUEST_POINTS_FAILED, '', constants.REQUEST_POINTS_FAILED_MSG, err.message, 500));
            callback(baseError, blockchainInitiated);
        }

        callback(null, blockchainInitiated);
    });
};

exports.transfer = function(req, res, next) {
    var transferJson = req.body;
    var user = req.session.user;

    if (_.isEmpty(transferJson)) {
        logger.debug(constants.USER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSFER_OBJ_EMPTY, '', constants.TRANSFER_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    pointsServiceImpl.transfer(transferJson, user, function (err, purchaseUnit) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSFER_WALLET_VALIDATION, '', constants.TRANSFER_WALLET_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Transferred"),
                data: purchaseUnit});
        }
    });   
}

exports.internalTransfer = function(req, res, next) {
    var transferJson = req.body;
    var user = req.session.user;
    transferJson.user = user;
    console.info('transferJson = ', transferJson);

    if (_.isEmpty(transferJson)) {
        logger.debug(constants.TRANSFER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSFER_OBJ_EMPTY, '', constants.TRANSFER_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    pointsServiceImpl.internalTransfer(transferJson, user, function (err, purchaseUnit) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSFER_WALLET_VALIDATION, '', constants.TRANSFER_WALLET_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Transferred"),
                data: purchaseUnit});
        }
    });   
}

exports.requestWithdraw = function(req, res, next) {
    var withdrawJson = req.body;
    var user = req.session.user;
    withdrawJson.user = user;
    console.info('withdrawJson = ', withdrawJson);

    if (_.isEmpty(withdrawJson)) {
        logger.debug(constants.WITHDRAW_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.WITHDRAW_OBJ_EMPTY, '', constants.WITHDRAW_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    pointsServiceImpl.requestWithdraw(withdrawJson, function (err, result) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.WITHDRAW_WALLET_VALIDATION, '', constants.WITHDRAW_WALLET_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Requested"),
                data: result});
        }
    });   
}

exports.purchaseUnits = function(req, res, next) {
    var purchaseJson = {};
    purchaseJson._id = req.params.userId;
    purchaseJson.totalNoOfPoints = req.params.totalNoOfPoints;
    purchaseJson.numberOfUnits = purchaseJson.totalNoOfPoints / 135;
    purchaseJson.user = req.session.user;
    var user = req.session.user;

    if (_.isEmpty(purchaseJson)) {
        logger.debug(constants.USER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.PURCHASE_UNIT_OBJ_EMPTY, '', constants.PURCHASE_UNIT_OBJ_EMPTY_MSG, '', 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    async.waterfall([
        async.apply(_purchaseUnits, purchaseJson),
        //_activateUser,
        //_levelCommission,
        //_sponsorUsers,
        //_saveLevelCommisionLedgers
        _notifyAdmin
    ], function (err, params) {
        //cb(err, params);
        if (err) {
            console.info('final err = ', err);
            //var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, err);
        } else {
            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Purchased units successfully"),
                data: params.purchaseUnit});
        }
    });
}

function _purchaseUnits(purchaseJson, callback) {
    var params = {};
    params.purchaseJson = purchaseJson;

    pointsServiceImpl.purchaseUnits(purchaseJson, function (err, results) {
        params.purchaseUnit = results.purchaseUnit;
        params.ledgers = results.ledgers;
        callback(err, params);
    });
}

function _notifyAdmin(params, callback) {
    var purchaseJson = params.purchaseJson;
    
    baseService.sendAdminPurchaseNotification(purchaseJson);
    callback(null, params);
}

function _activateUser(params, callback) {
    var user = params.purchaseJson.user
    if (!user.active) {
        userServiceImpl.activateUser(user, function (err, aUser) {
            params.user = aUser;
            callback(err, params);
        });
    } else {
        callback(null, params);
    }
}

function _levelCommission(params, callback) {
    var ids = baseService.getLevelUsers(params.purchaseJson.user);
    var ancestor = params.purchaseJson.user.ancestor;
    params.ancestorIds = ids;
    userServiceImpl.getReferralCount(ids, function(err, results) {
        params.levelCommission = results;
        params.levelData = baseService.getLevelCommissionEarnedWalletforPurchaseUint(ancestor, results);
        callback(err, params);
    });
}

function _sponsorUsers(params, callback) {
    userServiceImpl.getSponsorUsers(params.ancestorIds, function(err, results) {
        params.levelSponsorUsers = results;
        callback(err, params);
    });
}

function _saveLevelCommisionLedgers(params, callback) {
    var commissionLedgers = baseService.getLevelCommissionEarnedLedger(params);
    pointsServiceImpl.saveLevelCommisionLedgers(commissionLedgers, function (err, ledgers) {
        params.ledgers = ledgers;
        callback(err, params);
    });
}

// exports.purchaseUnits = function(req, res, next) {
//     var purchaseJson = {};
//     purchaseJson._id = req.params.userId;
//     purchaseJson.totalNoOfPoints = req.params.totalNoOfPoints;
//     purchaseJson.user = req.session.user;
//     console.info('purchaseJson = ', purchaseJson);
//     console.info('purchaseJson user = ', purchaseJson.user);
//     var user = req.session.user;

//     if (_.isEmpty(purchaseJson)) {
//         logger.debug(constants.USER_OBJ_EMPTY_MSG);
//         var baseError = new BaseError(Utils.buildErrorResponse(constants.PURCHASE_UNIT_OBJ_EMPTY, '', constants.PURCHASE_UNIT_OBJ_EMPTY_MSG, '', 500));
//         resEvents.emit('ErrorJsonResponse', req, res, baseError);
//     }

//     pointsServiceImpl.purchaseUnits(purchaseJson, function (err, purchaseUnit) {

//         if (err) {
//             logger.debug(err);
//             var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSFER_WALLET_VALIDATION, '', constants.TRANSFER_WALLET_VALIDATION_MSG, err.message, 500));
//             resEvents.emit('ErrorJsonResponse', req, res, baseError);
//         } else {
//             if (!user.active) {
//                 userServiceImpl.activateUser(user, function (err, user) {
//                     var ids = baseService.getLevelUsers(user);
//                     console.info('purchaseUnits ids = ', ids);
//                     if (err) {
//                         logger.debug(err);
//                         var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
//                         resEvents.emit('ErrorJsonResponse', req, res, baseError);
//                     } else {
//                         res.status(constants.HTTP_OK).send({
//                             status: baseService.getStatus(req, res, constants.HTTP_OK, "Purchased units successfully"),
//                             data: purchaseUnit});
//                     }
//                 });
//             } else {
//                 res.status(constants.HTTP_OK).send({
//                     status: baseService.getStatus(req, res, constants.HTTP_OK, "Purchased units successfully"),
//                     data: purchaseUnit});
//             }
//         }
//     });
// }

