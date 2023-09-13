/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , moment = require('moment')
    , Utils = require('../../util/util')
    , _ = require('lodash')
    , constants = require('../../commons/constants')
    , logger = require('../../commons/logger');
    
var Account = require('../../model/Account');

/**
 * Get All Accounts.
 *
 * @return {Function}
 * @api private
 */
function getAllAccounts(callback) {
    try {
        Account.find({})
            .exec(function (err, accounts) {
            logger.debug("get all accounts err "+ JSON.stringify(err));
            console.info('accounts = ', accounts);
            callback(err, accounts);
        });
    } catch (err) {
        logger.debug("get all accounts by admin err"+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getAllAccounts = getAllAccounts;