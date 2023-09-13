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
    , baseService = require('../../commons/base.service')
    , userServiceImpl = require('./user.service.impl')
    , ledgerServiceImpl = require('./ledger.service.impl');

var BlockchainInitiate = require('../../model/BlockchainInitiate');
var PurchaseUnit = require('../../model/PurchaseUnit');
var User = require('../../model/User');
var Ledger = require('../../model/Ledger');
var Withdraw = require('../../model/Withdraw');
var BinaryPayoutDetail = require('../../model/payout/BinaryPayoutDetail');
var BinaryPayout = require('../../model/payout/BinaryPayout');

const uuidv1 = require('uuid/v1');

/**
 * Get Transactions Wallet api.
 *
 * @return {Function}
 * @api public
 */
function getWalletTransactions(user, callback) {

    logger.info('Get wallet transactions by user : ', user);

    try {
        BinaryPayout.find({ user: mongoose.Types.ObjectId(user.userId) }, function (err, transactions) {
            logger.debug('Get wallet error : ', err);
            logger.debug('Get wallet transactions : ', transactions);
            callback(err, transactions);
        });
    } catch (err) {
        logger.debug("getWalletTransactions err", err);
        callback(err, null);
    }

}
exports.getWalletTransactions = getWalletTransactions;

/**
 * Get Cash Wallet Amount.
 *
 * @return {Function}
 * @api private
 */
function getWalletAmountByWalletType(userId, walletType, callback) {

    logger.info('Get wallet transactions by user : ' + walletType);

    try {
        var query = new Array();
        query.push({ $match: { wallet: mongoose.Types.ObjectId(walletType) , user: mongoose.Types.ObjectId(userId)} });
        query.push({ $group: { _id: "$wallet", credit: { $sum: "$credit" } , debit: { $sum: "$debit" }, available: { $sum: { $subtract: [ "$credit", "$debit" ] } } } });
        logger.info('Query for wallet by wallet type : ' + JSON.stringify(query));

        Ledger.aggregate(query, function (err, result) {
            if (result && result.length > 0) {
                result = result[0];
            }
            logger.debug("get wallet amount by use err"+ JSON.stringify(err));
            callback(err, result);
        });
    } catch (err) {
        logger.debug("get wallet amount by use err"+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getWalletAmountByWalletType = getWalletAmountByWalletType;

/**
 * Get Cash Wallet Transfers.
 *
 * @return {Function}
 * @api private
 */
function getCashWalletTransfers(userId, walletType, callback) {

    logger.info('Get Cash wallet transactions by user : ' + walletType);

    try {
        var query = { wallet: mongoose.Types.ObjectId(walletType) , user: mongoose.Types.ObjectId(userId)};
        logger.info('Query for Cash wallet by wallet type : ' + JSON.stringify(query));

        Ledger.find(query)
            .sort({created:-1})
            .exec(function (err, cashWalletTransfers) {
            logger.debug("get cash wallet amount by use err"+ JSON.stringify(err));
            callback(err, cashWalletTransfers);
        });
    } catch (err) {
        logger.debug("get cash wallet transfers by use err"+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getCashWalletTransfers = getCashWalletTransfers;

/**
 * Get Lot Wallet Transfers.
 *
 * @return {Function}
 * @api private
 */
function getLotWalletTransfers(userId, walletType, callback) {

    logger.info('Get Lot wallet transactions by user : ' + walletType);

    try {
        var query = { wallet: mongoose.Types.ObjectId(walletType) , user: mongoose.Types.ObjectId(userId)};
        logger.info('Query for lot wallet by wallet type : ' + JSON.stringify(query));

        Ledger.find(query)
            .sort({created:-1})
            .exec(function (err, cashWalletTransfers) {
            logger.debug("get lot wallet amount by use err"+ JSON.stringify(err));
            callback(err, cashWalletTransfers);
        });
    } catch (err) {
        logger.debug("get lot wallet transfers by use err"+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getLotWalletTransfers = getLotWalletTransfers;


/**
 * Get Withdraw Requests.
 *
 * @return {Function}
 * @api private
 */
function getWithdrawRequests(userId, callback) {
    try {
        var query = { "user._id": mongoose.Types.ObjectId(userId)};
        logger.info('Query get withdraw requests type : ' + JSON.stringify(query));

        Withdraw.find(query)
            .populate({path: 'wallet'})
            .sort({created:-1})
            .exec(function (err, withdraws) {
            logger.debug("get withdraw by user err"+ JSON.stringify(err));
            logger.info("Withdraws = " + withdraws);
            callback(err, withdraws);
        });
    } catch (err) {
        logger.debug("get withdraw by user err"+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getWithdrawRequests = getWithdrawRequests;

/**
 * Get All Withdraw Requests.
 *
 * @return {Function}
 * @api private
 */
function getAllWithdrawRequests(callback) {
    try {
        var query = {status : "REQUESTED"};
        Withdraw.find(query)
            .populate({path: 'wallet'})
            .exec(function (err, withdraws) {
            logger.debug("get all requests withdraw by user err"+ JSON.stringify(err));
            logger.info("Withdraws = " + withdraws);
            callback(err, withdraws);
        });
    } catch (err) {
        logger.debug("get all requests withdraw by user err"+ JSON.stringify(err));
        callback(err, null);
    }
}
exports.getAllWithdrawRequests = getAllWithdrawRequests;

/**
 * Get All Withdraws other than requests.
 *
 * @return {Function}
 * @api private
 */
function getAllWithdrawsOtherthanRequests(callback) {
    try {
        var query = {status : {$nin : ["REQUESTED"]}};
        Withdraw.find(query, function (err, withdraws) {
            logger.debug("get all other than requested withdraw by user err"+ JSON.stringify(err));
            logger.info("Withdraws = " + withdraws);
            callback(err, withdraws);
        });
    } catch (err) {
        logger.debug("get all other than requested withdraw by user err"+ JSON.stringify(err));
        callback(err, null);
    }
}
exports.getAllWithdrawsOtherthanRequests = getAllWithdrawsOtherthanRequests;

/**
 * Get Withdraw Requests.
 *
 * @return {Function}
 * @api private
 */
function getLastWithdrawRequested(userId, callback) {
    try {
        var query = { "user._id": mongoose.Types.ObjectId(userId), status : constants.WITHDRAW_STATUS_REQUESTED};
        logger.info('Query get last requested withdraw : ' + JSON.stringify(query));

        Withdraw.findOne(query)
            .populate({path : 'wallet'})
            .exec(function (err, withdraw) {
            logger.debug("get last requested withdraw by user err"+ JSON.stringify(err));
            logger.info("Withdraw = " + withdraw);
            callback(err, withdraw);
        });
    } catch (err) {
        logger.debug("get last requested withdraw by user err"+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getLastWithdrawRequested = getLastWithdrawRequested;

/**
 * Get Withdraw Details by id.
 *
 * @return {Function}
 * @api private
 */
function getWithdrawById(withdrawId, callback) {
    try {
        var query = { _id: mongoose.Types.ObjectId(withdrawId) };
        logger.info('Query get withdraw by id : ' + JSON.stringify(query));

        Withdraw.findOne(query)
            .populate({path : 'wallet'})
            .exec(function (err, withdraw) {
            logger.debug("get withdraw err"+ JSON.stringify(err));
            callback(err, withdraw);
        });
    } catch (err) {
        logger.debug("get withdraw by admin err"+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getWithdrawById = getWithdrawById;

/**
 * Get Deposit Request by id.
 *
 * @return {Function}
 * @api private
 */
function getDepositRequestById(depositReqId, callback) {
    try {
        var query = { _id: mongoose.Types.ObjectId(depositReqId) };
        logger.info('Query get deposit request by id : ' + JSON.stringify(query));

        BlockchainInitiate.findOne(query)
            .populate({path : 'wallet'})
            .exec(function (err, deposit) {
            logger.debug("get deposit err " + JSON.stringify(err));
            callback(err, deposit);
        });
    } catch (err) {
        logger.debug("get deposit by admin err " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getDepositRequestById = getDepositRequestById;

function updateBlockchainInitiate(depositReq, callback) {
    try {
        var updateQuery = {};

        if (depositReq.approvalStatus == constants.STATUS_APPROVED) {
            updateQuery.approved = true;
            updateQuery.deposited = true;
            updateQuery.status = constants.STATUS_DEPOSITED;
            updateQuery.approvedDate = new Date();
            updateQuery.depositedDate = new Date();
            updateQuery.comments = depositReq.reason;
        } else {
            updateQuery.rejected = true;
            updateQuery.rejectedDate = new Date();
            updateQuery.rejectedNotes = depositReq.reason;
            updateQuery.status = constants.STATUS_REJECTED;
        }
        var findQuery = {
            "_id": depositReq.depositId
        }

        logger.info("updateBlockchainInitiate query : " + JSON.stringify(updateQuery))
        // update withdraw by approval status
        BlockchainInitiate.update(findQuery, updateQuery, function (err, blockchainInitiate) {
            callback(err, blockchainInitiate);
        });

    } catch (err) {
        logger.debug("updateBlockchainInitiate err", err);
        callback(err, null);
    }

}
exports.updateBlockchainInitiate = updateBlockchainInitiate;

/**
 * Get All Withdraws.
 *
 * @return {Function}
 * @api private
 */
function getAllWithdrawHistory(callback) {
    try {
        var query = {status : {$nin : ["REQUESTED"]}};
        logger.info('Query get all withdraw history ' + JSON.stringify(query));
        Withdraw.find(query)
            .populate({path : 'wallet'})
            .sort({created:-1})
            .exec(function (err, withdraws) {
            logger.debug("get all withdraw history err"+ JSON.stringify(err));
            console.info('withdraws = ', withdraws);
            callback(err, withdraws);
        });
    } catch (err) {
        logger.debug("get all withdraw history by admin err"+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getAllWithdrawHistory = getAllWithdrawHistory;


function updateWithdraw(withdrawReq, callback) {
    try {
        var updateQuery = {};

        if (withdrawReq.approvalStatus == constants.WITHDRAW_STATUS_APPROVED) {
            updateQuery.approved = true;
            updateQuery.deposited = true;
            updateQuery.status = constants.WITHDRAW_STATUS_DEPOSITED;
            updateQuery.approvedDate = new Date();
            updateQuery.depositedDate = new Date();
            updateQuery.comments = withdrawReq.reason;
        } else {
            updateQuery.rejected = true;
            updateQuery.rejectedDate = new Date();
            updateQuery.rejectedNotes = withdrawReq.reason;
            updateQuery.status = constants.WITHDRAW_STATUS_REJECTED;
        }
        var findQuery = {
            "_id": withdrawReq.withdrawId
        }

        // update withdraw by approval status
        Withdraw.update(findQuery, updateQuery, function (err, blockchainInitiate) {
            callback(err, blockchainInitiate);
        });

    } catch (err) {
        logger.debug("updateWithdaraw err", err);
        callback(err, null);
    }

}
exports.updateWithdraw = updateWithdraw;