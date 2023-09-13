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
    , pointsServiceImpl = require('./impl/points.service.impl')
    , walletServiceImpl = require('./impl/wallet.service.impl')
    , ledgerServiceImpl = require('./impl/ledger.service.impl');

const uuidv1 = require('uuid/v1');

exports.getWalletTransactions = function(user, callback) {

    logger.info('Get Wallet Transctions for user = '+ user.userName);

    if (_.isEmpty(user)) {
        logger.debug(constants.USER_NOT_AVAILABLE);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
        callback(baseError, null);
    }

    walletServiceImpl.getWalletTransactions(user, function (err, transactions) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, transactions);
        }

        callback(null, transactions);
    });
};


exports.getCashWalletAmountByUser = function(userId, callback) {

    logger.info('Get Cash wallet amount by User' + userId);

    walletServiceImpl.getWalletAmountByWalletType(userId, constants.CASH_WALLET_WALLET, function (err, transactions) {
        if (err) {
            logger.debug('Get cash wallet amount by wallet type error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, transactions);
        }

        callback(null, transactions);
    });
};

exports.getLotWalletAmountByUser = function(userId, callback) {

    logger.info('Get Lot wallet amount by User' + userId);

    walletServiceImpl.getWalletAmountByWalletType(userId, constants.LOT_WALLET_WALLET, function (err, transactions) {
        if (err) {
            logger.debug('Get lot wallet amount by wallet type error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, transactions);
        }

        callback(null, transactions);
    });
};


exports.getCashWalletTransfers = function(userId, callback) {

    logger.info('Get cash wallet transfers by User' + userId);

    walletServiceImpl.getCashWalletTransfers(userId, constants.CASH_WALLET_WALLET, function (err, transfers) {
        if (err) {
            logger.debug('Get cash wallet transfers by wallet type error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, transfers);
        } else {
            callback(null, transfers);
        }
    });
};


exports.getLotWalletTransfers = function(userId, callback) {

    logger.info('Get Lot wallet transfers by User' + userId);

    walletServiceImpl.getLotWalletTransfers(userId, constants.LOT_WALLET_WALLET, function (err, transfers) {
        if (err) {
            logger.debug('Get lot wallet transfers by wallet type error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, transfers);
        } else {
            callback(null, transfers);
        }
    });
};

exports.getWithdrawRequests = function(userId, callback) {

    logger.info('Get withdraw requests by User ' + userId);

    walletServiceImpl.getWithdrawRequests(userId, function (err, withdraws) {
        if (err) {
            logger.debug('Get withdraw requests by user error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, withdraws);
        } else {
            callback(null, withdraws);
        }
    });
};

exports.getAllWithdrawRequests = function(callback) {

    walletServiceImpl.getAllWithdrawRequests(function (err, withdraws) {
        if (err) {
            logger.debug('Get all requests withdraw requests by user error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, withdraws);
        } else {
            callback(null, withdraws);
        }
    });
};

exports.getAllWithdrawsOtherthanRequests = function(callback) {

    walletServiceImpl.getAllWithdrawsOtherthanRequests(function (err, withdraws) {
        if (err) {
            logger.debug('Get all other than requested withdraw requests by user error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, withdraws);
        } else {
            callback(null, withdraws);
        }
    });
};

exports.getLastWithdrawRequested = function(userId, callback) {

    logger.info('Get last requested withdraw by User ' + userId);

    walletServiceImpl.getLastWithdrawRequested(userId, function (err, withdraw) {
        if (err) {
            logger.debug('Get last requested withdraw by user error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, withdraw);
        } else {
            callback(null, withdraw);
        }
    });
};

exports.getWithdrawById = function(withdrawId, callback) {

    logger.info('Get withdraw by id ' + withdrawId);

    walletServiceImpl.getWithdrawById(withdrawId, function (err, withdraw) {
        if (err) {
            logger.debug('Get withdraw error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, withdraw);
        } else {
            callback(null, withdraw);
        }
    });
};

exports.getDepositRequestById = function(depositReqId, callback) {

    logger.info('Get deposit request by id ' + depositReqId);

    walletServiceImpl.getDepositRequestById(depositReqId, function (err, deposit) {
        if (err) {
            logger.debug('Get deposit error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, deposit);
        } else {
            callback(null, deposit);
        }
    });
};

exports.getAllWithdrawHistory = function(callback) {
    logger.info('Get all withdraw history');

    walletServiceImpl.getAllWithdrawHistory(function (err, withdraws) {
        if (err) {
            logger.debug('Get withdraw error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.TRANSACTIONS_VALIDATION, '', constants.TRANSACTIONS_VALIDATION_MSG, err.message, 500));
            callback(baseError, withdraws);
        } else {
            callback(null, withdraws);
        }
    });
}

exports.initiateDepositApprovalProcess = function(depositReq, callback) {
    logger.info('initiateDepositApprovalProcess depositReq ' + JSON.stringify(depositReq));
    async.waterfall([
        async.apply(_getDepositById, depositReq),
        _constructDepositLedger,
        _saveDepositLedgerEntries,
        _updateBlockchainInitiateStatus,
        _getUpdatedBlockchainInitiateById
    ], function (err, params) {
        if(err) {
            logger.debug('Deposit approval Error : ' + JSON.stringify(err));
        } else {
            logger.debug('Deposit approval success');
        }
        callback(err, params.result);
    });
}

function _getDepositById(depositReq, callback) {
    var params = {};
    params.depositReq = depositReq;
    params.transactionId = uuidv1();

    walletServiceImpl.getDepositRequestById(depositReq.depositId, function (err, deposit) {
        params.deposit = deposit;
        callback(err, params);
    });
}

function _constructDepositLedger(params, callback) {
    logger.info('_constructDepositLedger depositReq ' + JSON.stringify(params.depositReq));
    logger.info('params.depositReq.approvalStatus = '+ JSON.stringify(params.depositReq.approvalStatus));
    params.depositLedger = baseService.getDepositWalletLedger(params);
    params.result = {};
    callback(null, params);
}

function _saveDepositLedgerEntries (params, callback) {

    logger.info('params.depositReq.approvalStatus deposit = ', params.depositReq.approvalStatus);
    if (params.depositReq.approvalStatus == constants.STATUS_APPROVED) {
        ledgerServiceImpl.saveLedgers([params.depositLedger], function(err, result) {
            params.ledgerResult = result;
            callback(err, params);
        })
    } else {
        callback(null, params);
    }
}

function _updateBlockchainInitiateStatus (params, callback) {
    logger.info("Calling _updateBlockchainInitiateStatus")
    walletServiceImpl.updateBlockchainInitiate(params.depositReq, function(err, result) {
        callback(err, params);
    })
}

function _getUpdatedBlockchainInitiateById (params, callback) {
    walletServiceImpl.getDepositRequestById(params.depositReq.depositId, function (err, blockchainInitiate) {
        params.result = blockchainInitiate;
        callback(err, params);
    })
}

exports.initiateWithrawApprovalProcess = function(withdrawReq, callback) {
    logger.debug('initiateWithrawApprovalProcess');
    async.waterfall([
        async.apply(_getWithdrawById, withdrawReq),
        _constructLedger,
        _saveWithdrawLedgerEntries,
        _updateWithdrawStatus,
        _getUpdatedWithdrawById
    ], function (err, params) {
        if(err) {
            logger.debug('Withdraw approval Error : ' + JSON.stringify(err));
        } else {
            logger.debug('Withdraw approval success');
        }
        callback(err, params.result);
    });
}

function _getWithdrawById(withdrawReq, callback) {
    var params = {};
    params.withdrawReq = withdrawReq;
    params.purchaseId = uuidv1();

    walletServiceImpl.getWithdrawById(withdrawReq.withdrawId, function (err, withdraw) {
        params.withdraw = withdraw;
        callback(err, params);
    });
}

function _constructLedger(params, callback) {
    params.walletLedger = baseService.getWithdrawWalletLedger(params);
    params.result = {};
    callback(null, params);
}

function _saveWithdrawLedgerEntries (params, callback) {

    if (params.withdrawReq.approvalStatus == constants.WITHDRAW_STATUS_APPROVED) {
        ledgerServiceImpl.saveLedgers([params.walletLedger], function(err, result) {
            params.ledgerResult = result;
            callback(err, params);
        })
    } else {
        callback(null, params);
    }
}

function _updateWithdrawStatus (params, callback) {
    walletServiceImpl.updateWithdraw(params.withdrawReq, function(err, result) {
        callback(err, params);
    })
}

function _getUpdatedWithdrawById (params, callback) {
    walletServiceImpl.getWithdrawById(params.withdrawReq.withdrawId, function (err, withdraw) {
        params.result = withdraw;
        callback(err, params);
    })
}