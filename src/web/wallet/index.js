var express = require('express')
    , router = express.Router()
    , async = require('async')
    , _ = require('lodash')
    , logger = require('../../commons/logger')
    , BaseError = require('../../commons/BaseError')
    , moment = require('moment')
    , constants = require('../../commons/constants')
    , renderConstants = require('../../commons/render.constants')
    , walletService = require('../../service/wallet.service')
    , pointsService = require('../../service/points.service');

const uuidv1 = require('uuid/v1');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(constants.SEND_GRID_MAIL_API_KEY);

router.get('/transactions', function(req, res, next) {
    logger.info('Get wallet transactions');

    var user = req.session.user;
    if (user) {
        walletService.getWalletTransactions({userId: user._id}, (err, transactions) => {
            logger.info('Error while getting wallet transactions : ' + JSON.stringify(err));
            res.render(renderConstants.WALLET_TRANSACTIONS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, transactions: transactions, moment: moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/internal/transfer', function(req, res, next) {
    logger.info('Get internal transfer');

    var user = req.session.user;
    if (user) {
        async.waterfall([
            async.apply(_getBalance, user),
            _getCashWalletDetails,
            _getLotWalletDetails,
            _getCashWalletTransfers,
            _getLotWalletTransfers,
            _getLastWithdrawRequested,
        ], function (err, result) {
            result.user = {};
            if(err) {
                logger.debug('Fetching internal transfer err : ' + JSON.stringify(err));
            }
            logger.debug('Inter transfer fetch completed');
            res.render(renderConstants.CASH_WALLET_INTERNAL_TRANSFER, { layout: renderConstants.LAYOUT_INNER, req: req, result : result, moment: moment});
        });

        /*var result = {}
        pointsService.getBalance({userId: user._id, walletId: constants.WT_TRADE_WALLET_ID}, (err, balance) => {
            logger.info('balance : ' + JSON.stringify(balance) + ", user : " + user.userName);
            result.balance = balance;
            walletService.getCashWalletAmountByUser(user._id, function(err, cashWallet) {
                if (!_.isEmpty(cashWallet)) {
                    result.cashWallet = cashWallet;
                }
                walletService.getLotWalletAmountByUser(user._id, function (err, lotWallet){
                    if (!_.isEmpty(lotWallet)) {
                        result.lotWallet = lotWallet;
                    }
                    logger.info('get internal transfer result : ' + JSON.stringify(result));
                    res.render(renderConstants.CASH_WALLET_INTERNAL_TRANSFER, { layout: renderConstants.LAYOUT_INNER, req: req, result : result, moment: moment});
                })
            });
        });*/
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/withdraw', function(req, res, next) {
    logger.info('Get withdraw');

    var user = req.session.user;
    if (user) {
        async.waterfall([
            async.apply(_getBalance, user),
            _getCashWalletDetails,
            _getLotWalletDetails,
            _getLastWithdrawRequested,
            _getWithdrawRequests
        ], function (err, result) {
            result.user = {};
            if(err) {
                logger.debug('Fetching withdraw err : ' + JSON.stringify(err));
            }
            logger.debug('withdraw fetch completed');
            res.render(renderConstants.WALLET_WITHDRAW, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, constants : constants, result : result, moment: moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

/*router.post('/withdraw', function(req, res, next) {
    var user = req.session.user;
    if (user) {
        console.info('withdraw');
        res.render(renderConstants.WALLET_WITHDRAW, { layout: renderConstants.LAYOUT_INNER, req: req, result : result, moment: moment});
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});*/

function _getBalance(user, callback) {
    var result = {};
    result.user = user;
    pointsService.getBalance({userId: user._id, walletId: constants.WT_TRADE_WALLET_ID}, (err, balance) => {
        logger.info('balance : ' + JSON.stringify(balance) + ", user : " + user.userName);
        result.balance = balance;
        callback(err, result);
    });
}

function _getCashWalletDetails(result, callback) {
    walletService.getCashWalletAmountByUser(result.user._id, function(err, cashWallet) {
        if (!_.isEmpty(cashWallet)) {
            result.cashWallet = cashWallet;
        }
        callback(err, result);
    });
}

function _getLotWalletDetails(result, callback) {
    walletService.getLotWalletAmountByUser(result.user._id, function (err, lotWallet){
        if (!_.isEmpty(lotWallet)) {
            result.lotWallet = lotWallet;
        }
        callback(err, result);
    });
}

function _getCashWalletTransfers(result, callback) {
    walletService.getCashWalletTransfers(result.user._id, function (err, transfers){
        result.cashWalletTransfers = transfers;
        callback(null, result);
    });
}

function _getLotWalletTransfers(result, callback) {
    walletService.getLotWalletTransfers(result.user._id, function (err, transfers){
        result.lotWalletTransfers = transfers;
        callback(null, result);
    });
}

function _getLastWithdrawRequested(result, callback) {
    walletService.getLastWithdrawRequested(result.user._id, function (err, requestedWithdraw){
        result.requestedWithdraw = requestedWithdraw;
        callback(null, result);
    });
}

function _getWithdrawRequests(result, callback) {
    walletService.getWithdrawRequests(result.user._id, function (err, withdraws){
        result.withdraws = withdraws;
        callback(null, result);
    });
}

module.exports = router;
