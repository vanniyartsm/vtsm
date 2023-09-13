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
    , baseService = require('../commons/base.service')
    , accountServiceImpl = require('./impl/account.service.impl');


exports.getAllAccounts = function(callback) {

    logger.info('Get All accounts for user');

    accountServiceImpl.getAllAccounts(function (err, accounts) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR, err.message, 500));
            callback(baseError, accounts);
        }

        callback(null, accounts);
    });
};