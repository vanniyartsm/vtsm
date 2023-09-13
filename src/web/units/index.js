var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , logout = require('express-passport-logout')
    , logger = require('../../commons/logger')
    , BaseError = require('../../commons/BaseError')
    , Utils = require('../..//util/util')
    , constants = require('../../commons/constants')
    , renderConstants = require('../../commons/render.constants')
    , resEvents = require('../../commons/events')
    , userServiceImpl = require('../../service/impl/user.service.impl')
    , pointsService = require('../../service/points.service')
    , pointsServiceImpl = require('../../service/impl/points.service.impl')
    , ledgerServiceImpl = require('../../service/impl/ledger.service.impl')
    , baseService = require('../../commons/base.service')
    , request = require('request')
    , moment = require('moment');
const uuidv1 = require('uuid/v1');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(constants.SEND_GRID_MAIL_API_KEY);
var liveBlockchain = global.config.system.liveBlockchain;

router.get('/buy', function(req, res, next) {
    logger.info('Get Initiated by User - units/index.js /buy');
    var user = req.session.user;

    if (user) {
        logger.info('Initiated by User : ' + user._id);
        if (_.isEmpty(user.btcwallet)) {
            logger.info('Initiating btc wallet creation for user, is liveBlockchain : ' + liveBlockchain);

            if (liveBlockchain) {
                var blockchainUrl = "https://api.blockchain.info/v2/receive?xpub=xpub6CZ4so2o5iy2RmLsH75KeFReWdaWXjijDJhg9cx4suQn4dTTcaSdf3iSNfTeKHAUgJmP67sY9kG1KSwMg3SAhsqwHUAZ266qNmKG8aVzMxC&callback=https%3A%2F%2Fquberos.com%2Fcallback%2Fblockchain%3Finvoice_id%3D"
                            + user._id + "%26secret%3D"
                            + user.userName + "&key=6fd3a9f0-f525-41a3-8dee-cdb4f2e1a5b1&gap_limit=100";
                request(blockchainUrl, { json: true }, (err, bcRes, body) => {
                    if (err) {
                        logger.debug('Error while requsting blockchain : ' + JSON.stringify(err));
                        //var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_PURCHASE_UNIT_VALIDATION, '', constants.PURCHASE_UNIT_VALIDATION_MSG, err.message, 500));
                        resEvents.emit('ErrorJsonResponse', req, res, err);
                    } else {
                        user.btcwallet = body.address //"1AQL5nHJZNGzDjxy1g4uWCBgdcZksdJCvG"; //body.address;
                        logger.info('Btc wallet created : ' + body.address);
                        //user.btcwallet = "1AQL5nHJZNGzDjxy1g4uWCBgdcZksdJCvG"; //body.address;
                        userServiceImpl.updateUserBTCWalletAddress(user, (err, uUser) => {
                            if (err) { 
                                logger.debug('Error while updating user : ' + JSON.stringify(err));
                                resEvents.emit('ErrorJsonResponse', req, res, err);
                            }
                            pointsServiceImpl.getBalance({userId: uUser._id, walletId: constants.WT_TRADE_WALLET_ID}, (err, balance) => {
                                logger.info('User balance : ' + JSON.stringify(balance));
                                res.render(renderConstants.BUY_POINTS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, balance: balance, liveBlockchain : liveBlockchain});
                            });
                        });
                    }
                });
            } else {
                user.btcwallet = "1AQL5nHJZNGzDjxy1g4uWCBgdcZksdJCvG"; //body.address;
                //user.btcwallet = "1AQL5nHJZNGzDjxy1g4uWCBgdcZksdJCvG"; //body.address;
                userServiceImpl.updateUserBTCWalletAddress(user, (err, uUser) => {
                    if (err) {
                        logger.debug('Error while updating user : ' + JSON.stringify(err));
                    }
                    pointsServiceImpl.getBalance({userId: uUser._id, walletId: constants.WT_TRADE_WALLET_ID}, (err, balance) => {
                        logger.info('User balance : ' + JSON.stringify(balance));
                        res.render(renderConstants.BUY_POINTS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, balance: balance, liveBlockchain : liveBlockchain});
                    });
                });
            }
        } else {
            pointsServiceImpl.getBalance({userId: user._id, walletId: constants.WT_TRADE_WALLET_ID}, (err, balance) => {
                pointsService.getPointsByUserId(user._id, function (err, blockchainInitiatedList) {
                    logger.info('User balance : ' + JSON.stringify(balance));
                    res.render(renderConstants.BUY_POINTS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, balance: balance, blockchainInitiatedList: blockchainInitiatedList, moment: moment, liveBlockchain : liveBlockchain});
                })
            });
        }
        logger.info("Request Btc wallet completed");
    } else {
        logger.info("User not logged in to buy");
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/buy/units', function(req, res, next) {
    logger.info('Get Buy Lots Initiated by User - buy/index.js /buy/inits');

    var user = req.session.user;
    if (user) {
        pointsServiceImpl.getBalance({userId: user._id, walletId: constants.WT_TRADE_WALLET_ID}, (err, balance) => {
            pointsService.getUnitsByUserId(user._id, function (err, purchaseUnits) {
                if (err) {
                    logger.debug('Error while getting lots : ' + JSON.stringify(err));
                }
                logger.info('User balance : ' + JSON.stringify(balance));
                logger.info("Request Get Lots completed");
                res.render(renderConstants.BUY_UNITS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, balance: balance, purchaseUnits: purchaseUnits, moment: moment});
            })
        });
    } else {
        logger.info("User not logged to see buy units");
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/transfer/points', function(req, res, next) {
    logger.info('buy points');
    var locals = {
        title: 'Page Title',
        description: 'Page Description',
        header: 'Page Header'
    };

    var user = req.session.user;
    if (user) {
        pointsServiceImpl.getBalance({userId: user._id, walletId: constants.WT_TRADE_WALLET_ID}, (err, balance) => {
            pointsService.getTransfersByUserId(user._id, function (err, result) {
                res.render(renderConstants.TRANSFER_UNITS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, balance: balance, moment: moment, result : result});
            })
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.post('/update', function(req, res, next) {
    logger.info('Post Update btc purchase Initiated by User - buy/index.js /update');
    var user = req.session.user;
    var pointsJson = req.body;

    if (pointsJson) {
        if (pointsJson.cryptoType == 'bitcoin') {
            pointsServiceImpl.updatePoints(pointsJson, (err, blockchainInitiate) => {
                if (err) { return console.log(err); }
                logger.info('blockchain intiate updated : ' + JSON.stringify(blockchainInitiate));
                var id = uuidv1();

                var ledgerJson = {};
                ledgerJson.userId = user._id;
                ledgerJson.walletId = constants.WT_TRADE_WALLET_ID;
                ledgerJson.wallet = constants.WT_TRADE_WALLET;

                ledgerJson.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
                ledgerJson.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

                ledgerJson.account = constants.AC_DEPOSIT_ACCOUNT_PURCHASE_POINTS;
                ledgerJson.accountId = constants.AC_DEPOSIT_ACCOUNT_PURCHASE_POINTS_ID;

                ledgerJson.credit = pointsJson.points;
                ledgerJson.purchaseId = pointsJson.id;
                ledgerJson.transactionId = id;
                ledgerJson.debit = 0;
                ledgerJson.updated = new Date();

                //console.info('ledgerJson = ', ledgerJson);
                logger.info('btc purchase update ledger save started');
                ledgerServiceImpl.saveLedger(ledgerJson, (err, ledger) => {
                    if (err) { 
                        var baseError = new BaseError(Utils.buildErrorResponse(constants.LEDGER_VALIDATION, '', constants.LEDGER_VALIDATION_MSG, err.message, 500));
                        res.render(renderConstants.BUY_POINTS_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, user: user, error: baseError});
                    } else {
                        
                        baseService.sendAdminBtcPurchaseNotification(user);
                        logger.info('btc purchase updated successfully for ' + user.userName);
                        res.render(renderConstants.BUY_POINTS_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, user: user});
                    }
                });
                
            });
        } else {
            var param = {};
            param.id = pointsJson.id;
            param.hash = pointsJson.hash;
            pointsService.initiateCryptoRequest(param, function (err, blockchainInitiated) {
                if (err) { 
                    var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
                    res.render(renderConstants.BUY_POINTS_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, user: user, error: baseError});
                } else {
                    
                    //baseService.sendPointsInitiatedMail(user);
                    logger.info('Crypto purchase initiated successfully for ' + user.userName);
                    res.render(renderConstants.BUY_POINTS_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, user: user, blockchainInitiated : blockchainInitiated});
                }
            });
        }
    }

});

router.get('/history', function(req, res, next) {
    console.info('history');

    var user = req.session.user;    
});

module.exports = router;