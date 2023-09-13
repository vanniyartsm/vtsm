/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , resEvents = require('../../commons/events')
    , moment = require('moment')
    , Utils = require('../../util/util')
    , SALT_WORK_FACTOR = 10
    , BaseError = require('../../commons/BaseError')
    , _ = require('lodash')
    , constants = require('../../commons/constants')
    , logger = require('../../commons/logger')
    , baseService = require('../../commons/base.service');

var Ledger = require('../../model/Ledger');
var BinaryPayout = require('../../model/payout/BinaryPayout');

function saveLedger (purchaseJson, callback) {
    var ledger = new Ledger({
        user: purchaseJson.userId,
        wallet: purchaseJson.wallet,
        walletId: purchaseJson.walletId,

        account: purchaseJson.account,
        accountId: purchaseJson.accountId,

        accountName: purchaseJson.accountName,
        accountType: purchaseJson.accountType,
        accountTypeId: purchaseJson.accountTypeId,

        accountTypeName: purchaseJson.accountTypeName,
        credit: parseFloat(purchaseJson.credit),
        debit: parseFloat(purchaseJson.debit),
        from: purchaseJson.from,
        purchaseId : purchaseJson.purchaseId,
        transactionId : purchaseJson.transactionId
    });

    // save ledger to database
    ledger.save(function(err) {
        callback(err, ledger);
    });
    
}
exports.saveLedger = saveLedger;

function saveLedgers (ledgerArray, callback) {
    //var array = [debitLedger, creditLedger];

    Ledger.create(ledgerArray, function(err, ledgers) {
    	callback(err, ledgers);
    });
}
exports.saveLedgers = saveLedgers;

function getBinaryPayoutTotalByUser(qo, callback) {
    var query = new Array();
    query.push({ $match: { user: mongoose.Types.ObjectId(qo.userId), wallet: mongoose.Types.ObjectId(constants.CASH_WALLET_WALLET)}});
    query.push({ $group: { _id: "$user", credit: { $sum: "$credit" }, debit: { $sum: "$debit" } } });

    Ledger.aggregate(query, function (err, result) {

        if (result && result.length > 0) {
            result = result[0];
        } else {
            result = {};
        }
        callback(err, result);
    })
}
exports.getBinaryPayoutTotalByUser = getBinaryPayoutTotalByUser;

function getLotBonusTotalByUser(qo, callback) {
    var query = new Array();
    query.push({ $match: { user: mongoose.Types.ObjectId(qo.userId), wallet: mongoose.Types.ObjectId(constants.LOT_WALLET_WALLET)}});
    query.push({ $group: { _id: "$user", credit: { $sum: "$credit" }, debit: { $sum: "$debit" } } });

    Ledger.aggregate(query, function (err, result) {

        if (result && result.length > 0) {
            result = result[0];
        } else {
            result = {};
        }
        callback(err, result);
    })
}
exports.getLotBonusTotalByUser = getLotBonusTotalByUser;