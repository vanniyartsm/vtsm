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
    , generalServiceImpl = require('./impl/general.service.impl');

const uuidv1 = require('uuid/v1');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(constants.SEND_GRID_MAIL_API_KEY);


exports.getAllSupportsByUser = function (userId, callback) {
    logger.info('Get all support by users in service userid : '+  userId);

    generalServiceImpl.getAllSupportsByUser(userId, function(err, supports){
        if (err) {
            console.info('Get all support by users in service : ', err);
            callback(err, null);
        } else {
            callback(err, supports);
        }
    });
}

exports.getAllOpenSupports = function (callback) {
    logger.info('Get all open support');

    generalServiceImpl.getAllOpenSupports(function(err, supports){
        if (err) {
            console.info('Get all open supports : ', err);
            callback(err, null);
        } else {
            callback(err, supports);
        }
    });
}

exports.getAllRespondedAndClosedSupports = function (callback) {
    logger.info('Get all cloased support');

    generalServiceImpl.getAllRespondedAndClosedSupports(function(err, supports){
        if (err) {
            console.info('Get all cloased supports : ', err);
            callback(err, null);
        } else {
            callback(err, supports);
        }
    });
}

exports.getSupportById = function (supportId, callback) {
    logger.info('Get support by supportId : '+  supportId);

    generalServiceImpl.getSupportById(supportId, function(err, supports){
        if (err) {
            console.info('Get supports by supportId in service : ', err);
            callback(err, null);
        } else {
            callback(err, supports);
        }
    });
}

exports.getSupportsDetails = function (supportTicket, callback) {
    logger.info('Get support by supportTicket : '+  supportTicket);

    generalServiceImpl.getSupportsDetails(supportTicket, function(err, supports){
        if (err) {
            console.info('Get supports by supportTicket in service : ', err);
            callback(err, null);
        } else {
            callback(err, supports);
        }
    });
}

exports.updateSupport = function(supportJson, support, callback) {
    generalServiceImpl.updateSupport(supportJson, support, function (err, result) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.SUPPORT_VALIDATION, '', constants.SUPPORT_VALIDATION_MSG, err.message, 500));
            callback(baseError, result);
        }

        callback(null, result);
    });
}
exports.saveSupport = function(supportJson, callback) {
    generalServiceImpl.saveSupport(supportJson, function (err, supports) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.SUPPORT_VALIDATION, '', constants.SUPPORT_VALIDATION_MSG, err.message, 500));
            callback(baseError, supports);
        }

        callback(null, supports);
    });
}

exports.saveSupportOld = function(supportJson, callback) {

    logger.info('save Support');

    if (!_.isEmpty(supportJson)) {

        var params = {};
        params.supportJson = supportJson;
    
        async.waterfall([
            async.apply(_saveSupport, params)
        ], function (err, params) {
            if (err) {
                console.info('final err = ', err);
                //var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
                resEvents.emit('ErrorJsonResponse', req, res, err);
            } else {
                callback(err, params);
            }
        });
    }
};