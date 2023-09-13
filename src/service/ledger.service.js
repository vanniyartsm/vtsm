/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , resEvents = require('../commons/events')
    , Utils = require('../util/util')
    , BaseError = require('../commons/BaseError')
    , _ = require('lodash')
    , constants = require('../commons/constants')
    , logger = require('../commons/logger')
    , baseService = require('../commons/base.service')
    , ledgerServiceImpl = require('./impl/ledger.service.impl');

const uuidv1 = require('uuid/v1');

exports.saveLedger = function(req, res, next) {

    // create a new ledger
    var ledgerJson = req.body;
    ledgerJson.purchaseId = uuidv1();

    if (_.isEmpty(ledgerJson)) {
        logger.debug(constants.LEDGER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.LEDGER_OBJ_EMPTY, '', constants.LEDGER_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    ledgerServiceImpl.saveLedger(ledgerJson, function (err, ledger) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.LEDGER_VALIDATION, '', constants.LEDGER_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        }

        res.status(constants.HTTP_OK).send({
            status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Saved"),
            data: ledger});
    });
};

exports.getEarningsTotalByUser = function (req, res, next) {
    var qo = {};
    qo.userId = req.params.userId;
    ledgerServiceImpl.getBinaryPayoutTotalByUser(qo, function (err, result) {
        ledgerServiceImpl.getLotBonusTotalByUser(qo, function (err, lotResult) {
            if (err) {
                logger.debug(err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
                resEvents.emit('ErrorJsonResponse', req, res, baseError);
            }
            var data = {};
            data.earnings = result;
            data.date = baseService.getDistanceDate();
            data.lotBonus = lotResult;

            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Fetched"),
                data: data});
        });
    });
}