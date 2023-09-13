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
var TradingPayoutDetail = require('../../model/payout/TradingPayoutDetail')
var PurchaseUnit = require('../../model/PurchaseUnit');
var User = require('../../model/User');
var Ledger = require('../../model/Ledger');
var Withdraw = require('../../model/Withdraw');
var Downline = require('../../model/Downline');
var DownlineStatus = require('../../model/DownlineStatus');
var BinaryPayoutDetail = require('../../model/payout/BinaryPayoutDetail');

const uuidv1 = require('uuid/v1');

function initiatePoints(pointsJson, callback) {
    var userSub = { _id: pointsJson.userId, userName: pointsJson.userName, sponsorId: pointsJson.sponsorId };

    var blockchainInitiate = new BlockchainInitiate({
        user: userSub,
        address: pointsJson.address,
        addressType: pointsJson.addressType,
        value: pointsJson.value,
        usd: pointsJson.usd,
        points: pointsJson.points,
        transactionHash: pointsJson.transactionHash,
        initiatedDate: pointsJson.initiatedDate,
        initiated: true,
        requested: false
    });

    // save blockchain initiate to database
    blockchainInitiate.save(function (err) {
        callback(err, blockchainInitiate);
    });

}
exports.initiatePoints = initiatePoints;

function updatePoints(pointsJson, callback) {
    try {
        var updateQuery = {
            "depositedDate": new Date(),
            "deposited": true,
            "transactionHash": pointsJson.hash,
            "updated": new Date()
        };

        var findQuery = {
            "_id": pointsJson.id
        }

        // save blockchain initiate to database
        BlockchainInitiate.update(findQuery, updateQuery, function (err, blockchainInitiate) {
            callback(err, blockchainInitiate);
        });

    } catch (err) {
        logger.debug("updatePoints err", err);
        callback(err, null);
    }

}
exports.updatePoints = updatePoints;


function getPointsByUserId(userId, callback) {
    logger.debug('getting points by userId = ', userId);

    try {

        BlockchainInitiate.find({ "user._id": mongoose.Types.ObjectId(userId) }).sort({ initiatedDate: 'desc' }).exec(function (err, blockchainInitiates) {
            callback(err, blockchainInitiates);
        });

    } catch (err) {
        logger.debug("getPointsByUserId err", err);
        callback(err, null);
    }

}
exports.getPointsByUserId = getPointsByUserId;

function getAllPendingBlockchainInitiated(callback) {
    logger.debug('getting all pending bitcoin initiated');

    try {

        BlockchainInitiate.find({"initiated": true, "deposited" : false})
            .sort({created:-1})
            .exec(function (err, blockchainInitiates) {
            callback(err, blockchainInitiates);
        });

    } catch (err) {
        logger.debug("getAllPendingBlockchainInitiated err", err);
        callback(err, null);
    }

}
exports.getAllPendingBlockchainInitiated = getAllPendingBlockchainInitiated;

function getAllRequestedBlockchainInitiated(callback) {
    logger.debug('getting all requested bitcoin initiated');

    try {

        BlockchainInitiate.find({"initiated": true, "deposited" : false, "requested": true, "rejected": false, "approved" : false})
            .sort({created:-1})
            .exec(function (err, blockchainInitiates) {
            callback(err, blockchainInitiates);
        });

    } catch (err) {
        logger.debug("getAllRequestedBlockchainInitiated err", err);
        callback(err, null);
    }

}
exports.getAllRequestedBlockchainInitiated = getAllRequestedBlockchainInitiated;

function getUnitsByUserId(userId, callback) {
    logger.info('Finding Points');
    try {

        PurchaseUnit.find({ "user._id": mongoose.Types.ObjectId(userId) }).sort({ created: 'desc' }).exec(function (err, purchaseUnits) {
            if (err) {
                logger.debug("Fetching points Error : " + JSON.stringify(err));
            }
            callback(err, purchaseUnits);
        });

    } catch (err) {
        logger.debug("Fetching points Error Catch Block : " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getUnitsByUserId = getUnitsByUserId;

function getAllPurchaseUnits(callback) {
    logger.info('Get Purchase Units');
    try {

        PurchaseUnit.find({}).exec(function (err, purchaseUnits) {
            if (err) {
                logger.debug("Fetching purchase units Error : " + JSON.stringify(err));
            }
            callback(err, purchaseUnits);
        });

    } catch (err) {
        logger.debug("Fetching purchase units Error Catch Block : " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getAllPurchaseUnits = getAllPurchaseUnits;

function saveTradingPayoutDetails(purchaseUnits, callback) {

    let tpda = new Array();
    var DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sss';

    for (let i = 0; i < purchaseUnits.length; i++) {
        var purchaseUnit = purchaseUnits[i];
        var created = purchaseUnit.created;

        for (let j = 1; j <= 60; j++) {
            created.setDate(created.getDate() + 7);
            var tdp = new TradingPayoutDetail({
                user: purchaseUnit.user,
                numberOfUnits: purchaseUnit.numberOfUnits,
                numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
                purchaseId: purchaseUnit.purchaseId,
                type: purchaseUnit.type,
                creditStatus : 'UPCOMING',
                creditDate : moment(created).format(DATE_FORMAT) + 'Z'
            });
            tpda.push(tdp);
        }
    }

    //console.info('tpda = ', tpda);

    TradingPayoutDetail.create(tpda, function (err, created) {
        callback(err ,created);
    });

    logger.info('TradingPayoutDetailArray Length = '+ tpda.length);
}
exports.saveTradingPayoutDetails = saveTradingPayoutDetails;

function getTransferPointsByUserId(userId, callback) {

    try {
        var query = new Array();
        query.push({ $match: { user: mongoose.Types.ObjectId(userId), accountId: constants.AC_TRANSFER_POINTS_ID } });
        query.push({ $group: { _id: "$user", credit: { $sum: "$credit" }, debit: { $sum: "$debit" }, available: { $sum: { $subtract: ["$credit", "$debit"] } } } });


        ledgerSummaryByUser(query, function (err, result) {
            callback(err, result);
        });

    } catch (err) {
        logger.debug("getTransferPointsByUserId err", err);
        callback(err, null);
    }

}
exports.getTransferPointsByUserId = getTransferPointsByUserId;

function getTransfersByUserId(userId, callback) {

    try {
        //var query = new Array();
        //query.push({ $match: { user: mongoose.Types.ObjectId(userId), accountId: constants.AC_TRANSFER_POINTS_ID } });

        //ledgerSummaryByUser(query, function (err, result) {
        console.info('userId = ', userId);
        //var query = { user: mongoose.Types.ObjectId(userId), wallet: mongoose.Types.ObjectId(constants.WT_TRADE_WALLET) };
        var query = {
            $and : [
                { user: mongoose.Types.ObjectId(userId) },
                { $or : [ { wallet : mongoose.Types.ObjectId(constants.WT_TRADE_WALLET) }, { wallet : mongoose.Types.ObjectId(constants.WT_PURCHASE_LOT_WALLET) } ] }
            ]
        }
        console.info('****** query = ', query);
        Ledger.find(query)
            .populate({path : 'account'})
            .sort({created:-1})
            .exec(function (err, transfers) {
                console.info('err = ', err);
                console.info('transfers = ', transfers);
                callback(err, transfers);
        });

    } catch (err) {
        logger.debug("getTransfersByUserId err", err);
        callback(err, null);
    }

}
exports.getTransfersByUserId = getTransfersByUserId;

function initiateRequest(id, callback) {

    try {
        var updateQuery = {
            "requestedDate": new Date(),
            "requested": true,
            "updated": new Date()
        };

        BlockchainInitiate.findOneAndUpdate({ _id: id }, updateQuery, { new: true }).then((data) => {
            if (data === null) {
                callback(null, null);
            } else {
                callback(null, data);
            }
        }).catch((err) => {
            callback(err, null);
        });

    } catch (err) {
        logger.debug("updatePoints err", err);
        callback(err, null);
    }

}
exports.initiateRequest = initiateRequest;

function initiateCryptoRequest(param, callback) {

    try {
        var updateQuery = {
            "requestedDate": new Date(),
            "requested": true,
            "transactionHash": param.hash,
            "updated": new Date()
        };

        BlockchainInitiate.findOneAndUpdate({ _id: param.id }, updateQuery, { new: true }).then((data) => {
            if (data === null) {
                callback(null, null);
            } else {
                callback(null, data);
            }
        }).catch((err) => {
            callback(err, null);
        });

    } catch (err) {
        logger.debug("updatePoints err", err);
        callback(err, null);
    }

}
exports.initiateCryptoRequest = initiateCryptoRequest;

function transfer(transferJson, user, callback) {
    console.info('transfer Json = ', transferJson);
    var transactionId = uuidv1();
    //var paramJson = {};
    //paramJson.userId = transferJson.fromUserId;
    //paramJson.walletId = constants.WT_TRADE_WALLET_ID;

    var query = new Array();
    query.push({ $match: { user: mongoose.Types.ObjectId(transferJson.fromUserId), walletId: 1} });
    query.push({ $group: { _id: "$walletId", credit: { $sum: "$credit" } , debit: { $sum: "$debit" }, available: { $sum: { $subtract: [ "$credit", "$debit" ] } } } });

    console.info('query = ', query);
    ledgerSummaryByUser(query, function (res) {
        console.info('arg = ', res);
        userServiceImpl.getUserByUserName(transferJson.toUserId, function (err, toUser) {
            console.info('toUser = ', toUser);
            console.info('err = ', err);
            if (toUser) {
                var toTransaction = new Ledger({
                    user: toUser._id,
                    wallet: constants.WT_TRADE_WALLET,
                    walletId: constants.WT_TRADE_WALLET_ID,

                    account: constants.AC_TRANSFER_POINTS,
                    accountId: constants.AC_TRANSFER_POINTS_ID,

                    accountName: transferJson.accountName,
                    accountType: constants.ACT_TRANSFER_ACCOUNT_TYPE,
                    accountTypeId: constants.ACT_TRANSFER_ACCOUNT_TYPE_ID,

                    accountTypeName: transferJson.accountTypeName,
                    credit: parseFloat(transferJson.amount),
                    debit: 0,
                    transferUser: {to : toUser._id, toUser : toUser.userName,
                        from : mongoose.Types.ObjectId(user._id), fromUser : user.userName},
                    purchaseId: uuidv1(),
                    transactionId: transactionId
                });

                var fromTransaction = new Ledger({
                    user: transferJson.fromUserId,
                    wallet: constants.WT_TRADE_WALLET,
                    walletId: constants.WT_TRADE_WALLET_ID,

                    account: constants.AC_TRANSFER_POINTS,
                    accountId: constants.AC_TRANSFER_POINTS_ID,

                    accountName: transferJson.accountName,
                    accountType: constants.ACT_TRANSFER_ACCOUNT_TYPE,
                    accountTypeId: constants.ACT_TRANSFER_ACCOUNT_TYPE_ID,

                    accountTypeName: transferJson.accountTypeName,
                    credit: 0,
                    debit: parseFloat(transferJson.amount),
                    transferUser: {to : toUser._id, toUser : toUser.userName,
                                    from : mongoose.Types.ObjectId(user._id), fromUser : user.userName},
                    purchaseId: uuidv1(),
                    transactionId: transactionId
                });

                var array = [fromTransaction, toTransaction];

                Ledger.insertMany(array, function (err, transactions) {
                    callback(err, transactions);
                });
            } else {
                var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_NAME_NOT_FOUND, '', constants.USER_NAME_NOT_FOUND_MSG, err.message, 406));
                callback(baseError, null);
            }
        });
    });
}
exports.transfer = transfer;

function internalTransfer(transferJson, user, callback) {
    console.info('transfer Json = ', transferJson);
    var transactionId = uuidv1();
    //var paramJson = {};
    //paramJson.userId = transferJson.fromUserId;
    //paramJson.walletId = constants.WT_TRADE_WALLET_ID;

    var query = new Array();
    console.info('transferJson = ', transferJson);
    query.push({ $match: { user: mongoose.Types.ObjectId(transferJson.fromUserId), wallet: mongoose.Types.ObjectId(transferJson.fromWalletId)} });
    query.push({ $group: { _id: "$walletId", credit: { $sum: "$credit" } , debit: { $sum: "$debit" }, available: { $sum: { $subtract: [ "$credit", "$debit" ] } } } });

    console.info('query = ', query);
    ledgerSummaryByUser(query, function (res) {
        console.info('arg = ', res);
            var toTransaction = new Ledger({
                user: mongoose.Types.ObjectId(user._id),
                wallet: constants.WT_TRADE_WALLET,
                walletId: constants.WT_TRADE_WALLET_ID,

                account: constants.AC_INTERNAL_TRANSFER_POINTS,
                accountId: constants.AC_INTERNAL_TRANSFER_POINTS_ID,

                accountName: transferJson.accountName,
                accountType: constants.ACT_TRANSFER_ACCOUNT_TYPE,
                accountTypeId: constants.ACT_TRANSFER_ACCOUNT_TYPE_ID,

                accountTypeName: transferJson.accountTypeName,
                credit: parseFloat(transferJson.amount),
                debit: 0,
                transferUser: {to : user._id, toUser : user.userName,
                    from : mongoose.Types.ObjectId(user._id), fromUser : user.userName},
                purchaseId: uuidv1(),
                transactionId: transactionId
            });

            var wallet = constants.CASH_WALLET_WALLET;
            var walletId = constants.CASH_WALLET_ID;

            if (transferJson.fromWalletId == constants.LOT_WALLET_WALLET) {
                console.info('******* lot wallet transfer');
                wallet = constants.LOT_WALLET_WALLET;
                walletId = constants.LOT_WALLET_ID
            } else {
                console.info('******* trade wallet transfer');
            }
            var fromTransaction = new Ledger({
                user: mongoose.Types.ObjectId(user._id),
                wallet: wallet,
                walletId: walletId,

                account: constants.AC_INTERNAL_TRANSFER_POINTS,
                accountId: constants.AC_INTERNAL_TRANSFER_POINTS_ID,

                accountName: transferJson.accountName,
                accountType: constants.ACT_TRANSFER_ACCOUNT_TYPE,
                accountTypeId: constants.ACT_TRANSFER_ACCOUNT_TYPE_ID,

                accountTypeName: transferJson.accountTypeName,
                credit: 0,
                debit: parseFloat(transferJson.amount),
                transferUser: {to : user._id, toUser : user.userName,
                                from : mongoose.Types.ObjectId(user._id), fromUser : user.userName},
                purchaseId: uuidv1(),
                transactionId: transactionId
            });

            var array = [fromTransaction, toTransaction];

            Ledger.insertMany(array, function (err, transactions) {
                callback(err, transactions);
            });
    });
}
exports.internalTransfer = internalTransfer;

function requestWithdraw(withdrawJson, callback) {
    console.info('withdraw Json requestWithdraw = ', withdrawJson);

    var userSub = { _id: withdrawJson.user._id, userName: withdrawJson.user.userName, sponsorId: withdrawJson.user.sponsorId };
    logger.info('userSub = ' + JSON.stringify(userSub));

    var withdraw = new Withdraw({
        user : userSub,
        address : withdrawJson.address,
        addressType: withdrawJson.addressType,
        value: withdrawJson.value,
        usd: withdrawJson.points,
        points: withdrawJson.points,
        requested: true,
        requestedDate: new Date(),
        transactionId: uuidv1(),
        status: constants.WITHDRAW_STATUS_REQUESTED,
        wallet: mongoose.Types.ObjectId(withdrawJson.walletId)
    });

    logger.info('withdraw = ' + JSON.stringify(withdraw));

    withdraw.save(function (err, result) {
        logger.info('err = '+ JSON.stringify(err));
        logger.info('result = '+ JSON.stringify(result));
        callback(err, result);
    });

}
exports.requestWithdraw = requestWithdraw;

function getBalance(balanceJson, callback) {
    var query = new Array();
    query.push({ $match: { user: mongoose.Types.ObjectId(balanceJson.userId), walletId: balanceJson.walletId } });
    query.push({ $group: { _id: "$user", credit: { $sum: "$credit" }, debit: { $sum: "$debit" }, available: { $sum: { $subtract: ["$credit", "$debit"] } } } });

    ledgerSummaryByUser(query, function (err, balance) {
        if (!_.isEmpty(balance)) {
            balance = balance[0];
        } else {
            balance = baseService.getBalance();
        }
        callback(err, balance);
    });
}
exports.getBalance = getBalance;

function purchaseUnits(purchaseLotJson, callback) {
    var userId = purchaseLotJson._id;
    var totalNoOfPoints = purchaseLotJson.totalNoOfPoints;
    var user = purchaseLotJson.user;
    validatePurchaseLots(user, function (err, result) {
        //console.info('result after = ', result);
        //console.info('result after total = ', result.total);
        //console.info('result after empty = ', !_.isEmpty(result));
        //console.info('result after max = ', result.total <= constants.MAXIMUM_LOTS_ALLOWED);

        //console.info('purchaseLotJson = ', purchaseLotJson);
        if ((purchaseLotJson.numberOfUnits + result.total) <= constants.MAXIMUM_LOTS_ALLOWED) {
            console.info('if check');
            if (purchaseLotJson) {
                getBalance({ userId: purchaseLotJson._id, walletId: constants.WT_TRADE_WALLET_ID }, (err, balance) => {
                    //console.info('balance.available = ', balance.available);
                    //console.info('totalNoOfPoints = ', totalNoOfPoints);
                    if (balance.available >= totalNoOfPoints) {
                        var purchaseJson = {};
                        purchaseJson.userId = user._id;
                        purchaseJson.userName = user.userName;
                        purchaseJson.sponsorId = user.sponsorId;
                        
                        purchaseJson.purchaseId = uuidv1();
                        // var lotType;

                        // if (user.bCount == 0) {
                        //     lotType = constants.BINARY_LOT;
                        // } else {
                        //     lotType = constants.SUPER_BINARY_LOT;
                        // }

                        // console.info('lotType = ', lotType);
                        // purchaseJson.type = lotType;

                        var pu = {};
                        pu.transactionId = purchaseJson.purchaseId;
                        pu.numberOfUnits = (totalNoOfPoints / constants.LOT_POINTS);
                        pu.currentUser = user;
                        var purchaseJsonArray = new Array();
                        var binaryCount = 0;
                        if (user.bCount == 0) {
                            user.bCount = user.bCount + 1;
                            user.status = constants.USER_TRADER_STATUS;
                            pu.bCount = user.bCount;
                            purchaseJson.type = constants.BINARY_LOT;
                            purchaseJson.numberOfUnits = user.bCount;
                            purchaseJson.numberOfPoints = constants.LOT_POINTS;
                            purchaseJsonArray.push(purchaseJson);
                            binaryCount = 1;

                            console.info('units = ', (totalNoOfPoints / constants.LOT_POINTS));
                            if ((totalNoOfPoints / constants.LOT_POINTS) > 1) {
                                pu.sbCount = (totalNoOfPoints / constants.LOT_POINTS) - 1;
                                user.sbCount = pu.sbCount;

                                var sbPurchaseJson = {};
                                sbPurchaseJson.userId = user._id;
                                sbPurchaseJson.userName = user.userName;
                                sbPurchaseJson.sponsorId = user.sponsorId;
                                sbPurchaseJson.numberOfUnits = pu.sbCount;
                                sbPurchaseJson.numberOfPoints = totalNoOfPoints - constants.LOT_POINTS;
                                sbPurchaseJson.purchaseId = purchaseJson.purchaseId;
                                sbPurchaseJson.type = constants.SUPER_BINARY_LOT;;
                                purchaseJsonArray.push(sbPurchaseJson);
                            }
                        } else {
                            purchaseJson.numberOfUnits = totalNoOfPoints / constants.LOT_POINTS;
                            purchaseJson.numberOfPoints = totalNoOfPoints;
                            purchaseJson.type = constants.SUPER_BINARY_LOT;
                            purchaseJsonArray.push(purchaseJson);

                            pu.sbCount = (totalNoOfPoints / constants.LOT_POINTS);
                            console.info('user.sbCount else = ', user.sbCount);
                            if (!user.sbCount) {
                                user.sbCount = 0;
                            }
                            user.sbCount = (user.sbCount + pu.sbCount);
                        }
                        logger.info('Purchase Unit = ' + JSON.stringify(pu));
                        console.info('-------------------------');
                        //console.info('purchaseJsonArray = ', purchaseJsonArray);

                        userServiceImpl.purchaseUnits(purchaseJsonArray, (err, pus) => {
                            //console.info('******** pus = ', pus);
                            saveTradingPayoutDetails(pus, function(err, result) {
                            

                                // purchaseJson.purchaseUnit = purchaseUnit;
                                // purchaseJson.purchaseUnitId = purchaseUnit._id;
                                var ledgerArray = new Array();

                                //construct debit ledger - trade wallet

                                var counter = 0;
                                var numberOfBUnits = 0;
                                console.info('pus = ', pus);
                                pus.forEach(purchaseJson => {
                                    var tradeWalletDebitJson = _.cloneDeep(purchaseJson);
                                    tradeWalletDebitJson.debit = tradeWalletDebitJson.numberOfPoints;
                                    tradeWalletDebitJson.userId = user._id;
                                    ledgerArray.push(baseService.getPurchasePointsLedger(tradeWalletDebitJson));
                                    //construct credit ledger - deposit wallet
                                    var depositWalletCreditJson = _.cloneDeep(purchaseJson);
                                    depositWalletCreditJson.credit = (depositWalletCreditJson.numberOfUnits * constants.QUBEROS_TOKEN_PER_LOT);
                                    depositWalletCreditJson.userId = user._id;
                                    console.info('depositWalletCreditJson = ', depositWalletCreditJson);
                                    ledgerArray.push(baseService.getPurchaseUnitsLedger(depositWalletCreditJson));

                                    var lot = { "lotId": purchaseJson._id, "numberOfUnits": purchaseJson.numberOfUnits, "numberOfPoints": purchaseJson.numberOfPoints, "purchaseId": purchaseJson.purchaseId, "created": purchaseJson.created, "updated": purchaseJson.updated, "type": purchaseJson.type };
                                    //console.info('user.lots = ', user.lots);
                                    
                                    user.lots.push(lot);
                                });
                                console.info('ledgerArray = ', ledgerArray);

                                //construct credit ledger admin - admin wallet
                                /*var adminWalletCreditJson = _.cloneDeep(purchaseJson);
                                adminWalletCreditJson.userId = constants.ADMIN_USER_ID;
                                adminWalletCreditJson.credit = (purchaseJson.numberOfUnits * 5);
                                ledgerArray[2] = baseService.getAdminWalletLedgerforPurchaseUint(adminWalletCreditJson);

                                //construct active bonus ledger admin - admin wallet
                                var activeBonusCreditJson = _.cloneDeep(purchaseJson);
                                activeBonusCreditJson.userId = constants.ADMIN_USER_ID;
                                var totalPoints = (totalNoOfPoints - (purchaseJson.numberOfUnits * 5))
                                activeBonusCreditJson.credit = totalPoints * 0.05;
                                ledgerArray[3] = baseService.getActiveBonusWalletforPurchaseUint(activeBonusCreditJson);*/

                                
                                //console.info('user.lots = ', user.lots);
                                //console.info('user = ', user);
                                userServiceImpl.getLotCountBySponsor({sponsorId: user.referralCode}, function (err, userLotCountInfo) {
                                    //console.info('userLotCountInfo = ', userLotCountInfo);
                                    if (userLotCountInfo && (userLotCountInfo.bCount > 0 || userLotCountInfo.sbCount > 0)) {
                                        user.status = constants.USER_SILVER_TRADER_STATUS;
                                    }
                                    userServiceImpl.updateUserByUser(user, (err, updatedUser) => {
                                        ledgerServiceImpl.saveLedgers(ledgerArray, (err, ledgers) => {
                                            var results = {};
                                            //results.purchaseUnit = purchaseUnit;
                                            if (user.sponsorId != -1) {
                                                userServiceImpl.getSponsor(user.sponsorId, function (err, sponsorUser) {
                                                    results.ledgers = ledgers;

                                                    //console.info('sponsorUser.status = ', sponsorUser.status);
                                                    if (sponsorUser.status == constants.USER_TRADER_STATUS) {
                                                        sponsorUser.status = constants.USER_SILVER_TRADER_STATUS;
                                                        //console.info('sponsorUser = ', sponsorUser);
                                                        userServiceImpl.updateUserByUser(sponsorUser, (err, updatedUser) => {
                                                            //console.info('sponsorUser = ', sponsorUser);
                                                            _updateTree(user, pu, err, callback);
                                                        });
                                                    } else {
                                                        // userServiceImpl.getLotCountBySponsor({sponsorId: user.sponsorId}, function (err, lotCountInfo) {
                                                        //     console.info('lotCountInfo = ', lotCountInfo);
                                                        //     if (lotCountInfo && (lotCountInfo.bCount > 0 || lotCountInfo.sbCount > 0)) {
                                                        //         sponsorUser.status = constants.USER_SILVER_TRADER_STATUS;
                                                        //         userServiceImpl.updateUserByUser(sponsorUser, (err, updatedUser) => {
                                                        //             _updateTree(user, pu, err, callback);
                                                        //         });
                                                        //     } else {
                                                                _updateTree(user, pu, err, callback);
                                                            //}
                                                        //});
                                                    }
                                                });
                                            }  else {
                                                _updateTree(user, pu, err, callback);
                                            }
                                            
                                        });
                                    });
                                })
                        
                            }); //saveTradingPayoutDetails
                        });
                    }
                });
            } else {
                callback(baseError, null);
            }
        } else {
            console.info('else check');
            var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.PURCHASE_UNIT_PURCHASE, '', constants.PURCHASE_UNIT_REACHED_MAX_MSG, constants.PURCHASE_UNIT_REACHED_MAX_MSG, 406));
            console.info('Throwing baseError = ', baseError);
            callback(baseError, result);
        }
    });
}
exports.purchaseUnits = purchaseUnits;

function _updateTree(user, pu, err, callback) {
    console.info('err = ', err);
    if (err) {
        var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.PURCHASE_UNIT_PURCHASE, '', constants.PURCHASE_UNIT_PURCHASE_MSG, err.message, 406));
        callback(baseError, results);
    } else {
        _updatePurchaseUnitTreeCount(user, pu, function (err, result) {
            callback(null, result);
        })
    }
}

function _updatePurchaseUnitTreeCount(user, pu, callback) {
    logger.debug('getting parent uers');
    _executeParentTreeTraversal(user, pu, function (err, result) {
        callback(err, result);
    });
}

async function _executeParentTreeTraversal(user, pu, cb) {
    var parents = await _runAsyncParentTreeCount(user._id, [], 0, pu);
    var lots = pu.numberOfUnits;
    logger.info('--------------- lots update starts ---------------');
    //console.info('lots before sending : ', lots);
    var updateSponsorTree = await _runAsyncDirectTreeCount(user, [], 0, lots, {});
    
    //var userLots = pu.numberOfUnits + (user.downlineLots ? user.downlineLots : 0);
    //var updateStatus = await _runAsyncDownlineStatus(user, [], 0, userLots, pu);
    logger.info('--------------- lots update ends ---------------');
    cb(null, parents);
}

async function printSponsorPreorder (user, docs, counter, callback) {
    console.info('user => ', user.userName, ' - lots => ', (user.bCount + user.sbCount));
    docs.push(user);
    counter++;
    let referralUsers = await User.find({sponsorId: user.referralCode});

    console.info('referralUsers Length = ', referralUsers.length);
    var query = new Array();
    var id = user._id;
    console.info('userId : ', id);
    query.push({ $match: { userId: id.toString() } });
    query.push({ $group: { _id: "$userId", lot: { $sum: "$lot" }  } });

    console.info('query : ', query);
    var downlineArray = await Downline.aggregate(query);
    var downlineLots = 0;
    if (downlineArray != undefined) {
        var downline = downlineArray[0];
        if (downline != undefined) {
            downlineLots = downline.lot;
        }
    }
    console.info("User : ", user.userName, " downline = ", downline);
    console.info('referralUsers = ', (referralUsers) ? referralUsers.length : 0);
    const filter = { _id: user._id };
    const update = {};
    update.downlineLots = downlineLots;
    console.info('downline.lot = ', downlineLots);
    let updatedUser = await User.findOneAndUpdate(filter, update);
    //console.info("updatedUser = ", updatedUser);


    console.info('counter = ', counter);

}

const _runAsyncParentTreeCount = async (id, users, counter, pu) => {
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    const user = await User.findOne({ _id: id }, query);
    //console.info('user = ', user);
    users.push(user);
    //console.info('counter = ', counter);
    //console.info('id = ', id);
    //console.info('parent = ', user);
    counter++;
    if (user) {
        if (user.parentId && user.parentId != -1) {
            //console.info('parent Id = ', user.parentId);
            const parentUser = await User.findOne({ _id: user.parentId }, query);
            //console.info('parentUser ==== ', parentUser);

            const filter = { _id: user.parentId };
            const update = {};
            var binaryPayoutDetail = new BinaryPayoutDetail({
                userId : user.parentId,
                userName : parentUser.userName,
                puUserId: pu.currentUser._id,
                puUserName: pu.currentUser.userName,
                transactionId : pu.transactionId
            })
            //console.info('user.position ==== ', user.position);
            if (user.position == constants.POSITION_LEFT) {
                if (pu.bCount == 1) {
                    update.puLeftBCount = parentUser.puLeftBCount + pu.bCount;
                    binaryPayoutDetail.puLeftBCount = pu.bCount;

                    if (pu.numberOfUnits > 1) {
                        update.puLeftSBCount = parentUser.puLeftSBCount + pu.sbCount;
                        binaryPayoutDetail.puLeftSBCount = pu.sbCount;
                    }
                } else {
                    update.puLeftSBCount = parentUser.puLeftSBCount + pu.sbCount;
                    binaryPayoutDetail.puLeftSBCount = pu.sbCount;
                }
            } else {
                if (pu.bCount == 1) {
                    update.puRightBCount = parentUser.puRightBCount + pu.bCount;
                    binaryPayoutDetail.puRightBCount = pu.bCount;

                    if (pu.numberOfUnits > 1) {
                        update.puRightSBCount = parentUser.puRightSBCount + pu.sbCount;
                        binaryPayoutDetail.puRightSBCount = pu.sbCount;
                    }
                } else {
                    update.puRightSBCount = parentUser.puRightSBCount + pu.sbCount;
                    binaryPayoutDetail.puRightSBCount = pu.sbCount;
                }
            }
            console.info('filter ==== ', filter);
            console.info('update ==== ', update);
            let updatedParentUser = await User.findOneAndUpdate(filter, update);

            //var puQuery = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
           
            const bpd = await BinaryPayoutDetail.create(binaryPayoutDetail);

            const parent = await _runAsyncParentTreeCount(user.parentId, users, counter, pu);
            //console.log('parent ==== ', parent, ' counter = ', counter);
        }

    }

    //return users;
    //console.info('final');
    //console.info('counter = ', counter);
    //console.log(users);
    if (counter == 1) {
        return users;
    }
}

async function _executeSponsorTreeTraversal(user) {
    var lots = (user.bCount + user.sbCount);
    return await _runAsyncDirectTreeCount(user, [], 0, lots, {});
}

const _runAsyncDirectTreeCount = async (user, users, counter, lots, pu) => {
    const filter = { referralCode: user.sponsorId };
    const sponsorUser = await User.findOne(filter);
    
    if (user && sponsorUser) {
        const filter = { _id: sponsorUser._id };
        const update = {};
        update.downlineLots = lots + (sponsorUser.downlineLots ? sponsorUser.downlineLots : 0);

        let updatedUser = await User.findOneAndUpdate(filter, update);
        counter++;
        const parent = await _runAsyncDirectTreeCount(sponsorUser, users, counter, lots, pu);
    }

    if (counter == 1) {
        return lots;
    }
}

const _runAsyncDownlineStatus = async (user, users, counter, userLots, pu) => {
    //var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    //const user = await User.findOne({ _id: id }, query);
    const filter = { referralCode: user.sponsorId };
    const sponsorUser = await User.findOne(filter);
    
    if (user && sponsorUser) {
        if (userLots > 0 && user.status != constants.USER_REG_STATUS && user.status != constants.USER_TRADE_STATUS) {

            var query = new Array();
            var id = user._id;
            //console.info('userId : ', id);
            query.push({ $match: { userId: id.toString() } });
            query.push({ $group: { _id: "$status", count:{$sum:1}  } });
  
            var downlineStatusArray = await DownlineStatus.aggregate(query);
            const filter = { _id: user._id };
            const update = {};
            
            console.info('downlineStatusArray = ', downlineStatusArray);
            if (_.find(downlineStatusArray, {_id : constants.USER_PLATINUM_TRADER_STATUS } )) {
                  console.info('user = ', user.userName, ' Status = ', constants.USER_PLATINUM_TRADER_STATUS);
                  update.status = constants.USER_PLATINUM_TRADER_STATUS;
            } else if (_.find(downlineStatusArray, {_id : constants.USER_DIAMOND_TRADER_STATUS } )) {
                  console.info('user = ', user.userName, ' Status = ', constants.USER_DIAMOND_TRADER_STATUS);
                  update.status = constants.USER_PEARL_TRADER_STATUS;
            } else if (_.find(downlineStatusArray, {_id : constants.USER_PEARL_TRADER_STATUS } )) {
                  console.info('user = ', user.userName, ' Status = ', constants.USER_PEARL_TRADER_STATUS);
                  update.status = constants.USER_PEARL_TRADER_STATUS;
            } else if (_.find(downlineStatusArray, {_id : constants.USER_GOLD_TRADER_STATUS } )) {
                  console.info('user = ', user.userName, ' Status = ', constants.USER_GOLD_TRADER_STATUS);
                  update.status = constants.USER_GOLD_TRADER_STATUS;
            }

            console.info('update = ', update);
  
            if (update.status != undefined) {
                console.info('Filter = ', filter);
                console.info('Update = ', update);
                let updatedUser = await User.findOneAndUpdate(filter, update);
            }
          }
            userLots = pu.numberOfUnits + (sposorUser.downlineLots ? sposorUser.downlineLots : 0);
            counter++;
            const parent = await _runAsyncDownlineStatus(sponsorUser, users, counter, sponsorLots, pu);
    }
    //console.info('parent counter  = ', counter);
    if (counter == 1) {
        return sponsorLots;
    }
}

// const _runAsyncDownlineStatus = async (user, users, counter, sponsorLots, pu) => {
//     //var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
//     //const user = await User.findOne({ _id: id }, query);
//     const filter = { referralCode: user.sponsorId };
//     const sponsorUser = await User.findOne(filter);
    
//     if (user && sponsorUser) {
//             var lots = sponsorLots + (sponsorUser.downlineLots ? sponsorUser.downlineLots : 0);
//             if (lots > 0 && sponsorUser.status != constants.USER_REG_STATUS && sponsorUser.status != constants.USER_TRADE_STATUS) {
//                 var downlineStatus = new DownlineStatus({
//                     userId : sponsorUser._id,
//                     userName : sponsorUser.userName,
//                 });
    
//                 console.info("----------> lots : ", lots);
//                 console.info("----------> pu : ", pu);
//                 if (lots >= 200) {
//                     const sponsorFilter = { _id: sponsorUser._id };
//                     const update = {};

//                     if (pu.diamondTrader >= 2) {
//                         downlineStatus.status = constants.USER_PLATINUM_TRADER_STATUS
//                         downlineStatus.statusId = 7;
//                     } else if (pu.pearlTrader >= 2) {
//                         downlineStatus.status = constants.USER_DIAMOND_TRADER_STATUS
//                         downlineStatus.statusId = 6;
//                     } else if (pu.goldTrader >= 2) {
//                         downlineStatus.status = constants.USER_PEARL_TRADER_STATUS
//                         downlineStatus.statusId = 5;
//                     } else {
//                         downlineStatus.status = constants.USER_GOLD_TRADER_STATUS
//                         downlineStatus.statusId = 4;
//                     }

//                     update.status = downlineStatus.status;
//                     update.statusId = downlineStatus.statusId;

//                     let updatedDownlineStatus = await downlineStatus.save();
//                     console.info("updatedDownlineStatus : ", updatedDownlineStatus);
//                     let updatedUser = await User.findOneAndUpdate(sponsorFilter, update);
//                 }
    
//                 //if (userStatus)
//                 if (downlineStatus.status == constants.USER_GOLD_TRADER_STATUS) {
//                     pu.goldTrader = ((pu.goldTrader) ? pu.goldTrader : 0) + 1;
//                 } else if (downlineStatus.status == constants.USER_PEARL_TRADER_STATUS) {
//                     pu.pearlTrader = ((pu.pearlTrader) ? pu.pearlTrader : 0) + 1;
//                 } else if (downlineStatus.status == constants.USER_DIAMOND_TRADER_STATUS) {
//                     pu.diamondTrader = ((pu.diamondTrader) ? pu.diamondTrader : 0) + 1;
//                 } else if (downlineStatus.status == constants.USER_PLATINUM_TRADER_STATUS) {
//                     pu.platinumTrader = ((pu.platinumTrader) ? pu.platinumTrader : 0) + 1;
//                 }
    
//                 //console.info('Sponsor User : ', sponsorUser.userName ,' Current User Lots : ', currentUserLots , ' Total Lots = ', lots, ' Status = ', (update.status != undefined) ? update.status : '');
//             }
//             //lots = (sponsorUser.bCount + sponsorUser.sbCount) + (sponsorUser.downlineLots ? sponsorUser.downlineLots : 0);


//             var query = new Array();
//             var id = sponsorUser._id;
//             //console.info('userId : ', id);
//             query.push({ $match: { userId: id.toString() } });
//             query.push({ $group: { _id: "$status", count:{$sum:1}  } });

//             var downlineStatusArray = await DownlineStatus.aggregate(query);
//             const statusFilter = { _id: sponsorUser._id };
//             const statusUpdate = {};
//             console.info('user = ', sponsorUser.userName);
//             for(var i = 0; i < downlineStatusArray.length; i++) {
//                 var status = downlineStatusArray[i];
//                 var id = status._id;
//                 var count = status.count;
//                 console.info('status = ', status);
//                 if (id == constants.USER_PLATINUM_TRADER_STATUS) {
//                     statusUpdate.status = constants.USER_PLATINUM_TRADER_STATUS;
//                     break;
//                 } else if (id == constants.USER_DIAMOND_TRADER_STATUS) {
//                     statusUpdate.status = constants.USER_DIAMOND_TRADER_STATUS;
//                     break;
//                 } else if (id == constants.USER_PEARL_TRADER_STATUS) {
//                     statusUpdate.status = constants.USER_PEARL_TRADER_STATUS;
//                     break;
//                 } else if (id == constants.USER_GOLD_TRADER_STATUS) {
//                     statusUpdate.status = constants.USER_GOLD_TRADER_STATUS;
//                     break;
//                 }
//             }
//             console.info('update statusUpdate = ', statusUpdate);

//             if (statusUpdate.status != undefined) {
//                 console.info('statusFilter = ', statusFilter);
//                 console.info('statusUpdate = ', statusUpdate);
//                 let updatedUser = await User.findOneAndUpdate(statusFilter, statusUpdate);
//             }

//             counter++;
//             const parent = await _runAsyncDownlineStatus(sponsorUser, users, counter, sponsorLots, pu);
//     }
//     //console.info('parent counter  = ', counter);
//     if (counter == 1) {
//         return sponsorLots;
//     }
// }

function validatePurchaseLots(user, callback) {
    try {
        var query = new Array();
        //query.push({ $match: { user: mongoose.Types.ObjectId(userId)}});
        query.push({ $match: { "user._id": mongoose.Types.ObjectId(user._id) } })
        query.push({ $group: { _id: "$user", total: { $sum: "$numberOfUnits" } } });

        PurchaseUnit.aggregate(query, function (err, result) {
            if (!_.isEmpty(result)) {
                result = result[0];
            } else {
                result.total = 0;
            }
            callback(err, result);
        });

    } catch (err) {
        callback(err, null);
    }
}

exports.validatePurchaseLots = validatePurchaseLots;

function getLotsByUserDateRange(qo, callback) {
    try {
        var query = new Array();
        //query.push({ $match: { user: mongoose.Types.ObjectId(userId)}});
        query.push({ $match: { "user._id": mongoose.Types.ObjectId(qo.user._id), created: {$gte: new Date(qo.startDateFrom), $lt: new Date(qo.endDateTo)}} })
        //query.push({ $match: { created: {$gte: new Date(payoutDateObj.payoutDateFrom), $lt: new Date(payoutDateObj.payoutDateTo)}}});
        query.push({ $group: { _id: "$user", total: { $sum: "$numberOfUnits" } } });

        PurchaseUnit.aggregate(query, function (err, result) {
            if (!_.isEmpty(result)) {
                result = result[0];
            } else {
                result.total = 0;
            }
            callback(err, result);
        });

    } catch (err) {
        logger.debug("getLotsByUserDateRange err", err);
        callback(err, null);
    }
}

exports.getLotsByUserDateRange = getLotsByUserDateRange;

function saveLevelCommisionLedgers(commissionLedgers, callback) {
    Ledger.create(commissionLedgers, function (err, ledgers) {
        callback(err, ledgers);
    });
}
exports.saveLevelCommisionLedgers = saveLevelCommisionLedgers;

function ledgerSummaryByUser(query, callback) {
    Ledger.aggregate(query,
        function (err, res) {
            //if (err) return handleError(err);
            callback(err, res);
        })
}
exports.ledgerSummaryByUser = ledgerSummaryByUser;