/**
 * Created by senthil on 08/04/17.
 */
var Utils = require('../util/util')
    , resEvents = require('../commons/events')
    , BaseError = require('../commons/BaseError')
    , _ = require('lodash')
    , moment = require('moment')
    , constants = require('../commons/constants')
    , logger = require('../commons/logger')
    , baseService = require('../commons/base.service')
    , payoutServiceImpl = require('./impl/payout.service.impl')
    , dashboardServiceImpl = require('./impl/dashboard.service.impl');

exports.getDashboardDetails = function(userId, callback) {

    if (_.isEmpty(userId)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        callback(baseError, null);
    }

    var info = {};
    info.userId = userId;

    dashboardServiceImpl.getDashboardDetails(info, function (err, result) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            callback(baseError, result);
        }

        callback(null, result);
    });
};


exports.getWalletByUser = function(req, res, next) {
    var userId = req.params.id;

    if (_.isEmpty(userId)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    var qo = {};
    qo.userId = userId;

    dashboardServiceImpl.getWalletDetailsByUser(qo, function (err, result) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.LEDGER_VALIDATION, '', constants.LEDGER_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        }

        res.status(constants.HTTP_OK).send({
            status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Saved"),
            data: result});

    });
};

exports.getLotByUser = function(req, res, next) {
    var userId = req.params.id;

    if (_.isEmpty(userId)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    var qo = {};
    qo.userId = userId;

    dashboardServiceImpl.getLotDetailsByUser(qo, function (err, result) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.LEDGER_VALIDATION, '', constants.LEDGER_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        }

        res.status(constants.HTTP_OK).send({
            status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Saved"),
            data: result});

    });
};

exports.getDownlineTree = function (req, res, next) {
    var userId = req.params.userId;

    if (_.isEmpty(userId)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    var startDate = new Date();
    var endDate = new Date();
    startDate.setDate(startDate.getDate());
    endDate.setDate(endDate.getDate() + 1);
    startDate = moment(startDate).format('YYYY-MM-DD')
    endDate = moment(endDate).format('YYYY-MM-DD')
    var startDateFrom = moment(startDate).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z';
    var endDateTo = moment(endDate).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z';
    
    var param = {};
    var payoutDateObj = {};
    payoutDateObj.payoutDateFrom = startDateFrom;
    payoutDateObj.payoutDateTo = endDateTo;
    param.payoutDateObj = payoutDateObj;
    param.userId = userId;

    dashboardServiceImpl.getBinaryPayoutDetailsByUser(param, function (err, result) {
        console.info('getBinaryPayoutDetailsByUser result = ', result);
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        }

        res.status(constants.HTTP_OK).send({
            status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Fetched"),
            data: result});
    });
}