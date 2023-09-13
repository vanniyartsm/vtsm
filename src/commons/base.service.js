/**
 * Created by senthil on 08/04/17.
 */
var express = require('express');
var _ = require('lodash');
var util = require('util');
var moment  = require('moment');
var mongoose = require('mongoose');
var Status = require('../domains/Status');
var Balance = require('../domains/Balance');
var constants = require('./constants');
var rTracer = require('cls-rtracer');
//var tc = require('./test.constants');
//var es = require('../../src/search/es.config');
var logger = require('./logger');
var uuid = require('uuid');
const uuidv1 = require('uuid/v1');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(constants.SEND_GRID_MAIL_API_KEY);

var Ledger = require('../model/Ledger');
var TradingPayoutDetail = require('../model/payout/TradingPayoutDetail');

var A_USER = "596c8bf65a12076ff0cc74b1";

exports.getStatus = function(req, res, statusCode, statusMessage) {
    Status.code = statusCode;
    Status.message = statusMessage;

    return Status;
}

exports.getBalance = function() {
 
    return Balance;
}

exports.getParam = function(key, valueObj) {
    var params = {};
    params[key] = valueObj;

    return params;
}

function checkEsConnection(callback) {
    es.getMaster.ping({
        requestTimeout: Infinity,
    }, function (error) {
        if (error) {
            global.config.elasticSearch.connection = false;
            callback(error, null)
        } else {
            global.config.elasticSearch.connection = true;
            callback(null, true)
        }
    });
}

exports.checkEsConnection = checkEsConnection;

function checkMongoAndEsConnections(callback) {
    checkEsConnection(function (err, result) {
        if (err) {
            global.config.elasticSearch.connection = false;
            callback(false)
        } else {
            global.config.elasticSearch.connection = true;
            if(global.config.mongodb.connection && global.config.elasticSearch.connection) {
                callback(true)
            }
        }
    });
}

exports.checkMongoAndEsConnections = checkMongoAndEsConnections;

function checkCrudPermission(projectPermission) {
    var permCheck = {};
    permCheck.create = false;
    permCheck.update = false;
    permCheck.read = false;
    permCheck.delete = false;
    if(projectPermission.length > 0) {
        _.forEach(projectPermission , function (val) {
            var name = (val.name).split("_");

            if(name[1] == constants.CREATE) {
                permCheck.create = true;
                return;
            }

            if(name[1] == constants.UPDATE) {
                permCheck.update = true;
                return;
            }

            if(name[1] == constants.READ) {
                permCheck.read = true;
                return;
            }

            if(name[1] == constants.DELETE) {
                permCheck.delete = true;
                return;
            }
        })
    }
    return permCheck;
}
exports.checkCrudPermission = checkCrudPermission;

exports.getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

exports.setPurchaseUnitAccountInformation = function (json) {
    json.walletId = constants.WT_TRADE_WALLET_ID;
    json.wallet = constants.WT_TRADE_WALLET;

    json.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
    json.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

    json.account = constants.AC_PURCHASE_UNITS;
    json.accountId = constants.AC_PURCHASE_UNITS;

    return json;
}

exports.getPayoutLedger = function (json) {

    var ledger = new Ledger({
        user: json.userId,
        wallet: json.wallet,
        walletId: json.walletId,

        account: json.account,
        accountId: json.accountId,

        accountName: json.accountName,
        accountType: json.accountType,
        accountTypeId: json.accountTypeId,

        accountTypeName: json.accountTypeName,
        credit: json.credit,
        debit: json.debit,
        from: json.from,
        purchaseId : json.purchaseId,
        transactionId : json.transactionId,
        purchaseUnitId: json.purchaseUnitId,
        cutoffId: json.cutoffId,
        payoutType: json.payoutType
    });

    return ledger;
}

exports.getLedger = function (json) {

    var ledger = new Ledger({
        user: json.userId,
        wallet: json.wallet,
        walletId: json.walletId,

        account: json.account,
        accountId: json.accountId,

        accountName: json.accountName,
        accountType: json.accountType,
        accountTypeId: json.accountTypeId,

        accountTypeName: json.accountTypeName,
        credit: parseFloat(json.credit),
        debit: parseFloat(json.debit),
        from: json.from,
        purchaseId : json.purchaseId,
        transactionId : json.transactionId,
        purchaseUnitId: json.purchaseUnitId,
        type: json.type
    });

    return ledger;
}

exports.getPurchasePointsLedger = function (json) {
    json.user = json.userId;
    json.walletId = constants.WT_TRADE_WALLET_ID;
    json.wallet = constants.WT_TRADE_WALLET;

    json.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
    json.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

    json.account = constants.AC_DEPOSIT_ACCOUNT_PURCHASE_POINTS;
    json.accountId = constants.AC_DEPOSIT_ACCOUNT_PURCHASE_POINTS_ID;

    json.credit = (json.credit) ? json.credit : 0;
    json.debit = (json.debit) ? json.debit : 0;

    json.purchaseId = (json.purchaseId) ? json.purchaseId : uuidv1();
    json.transactionId = (json.transactionId) ? json.transactionId : uuidv1();
    //json.purchaseUnitId = (json.purchaseUnitId) ? json.purchaseUnitId : "";
    json.from = (json.from) ? json.from : "";

    json.updated = new Date();

    return this.getLedger(json);
}

exports.getPurchaseUnitsLedger = function (json) {
    json.user = json.userId;
    json.walletId = constants.WT_DEPOSIT_WALLET_ID;
    json.wallet = constants.WT_DEPOSIT_WALLET;

    json.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
    json.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

    json.account = constants.AC_PURCHASE_UNITS;
    json.accountId = constants.AC_PURCHASE_UNITS_ID;

    json.credit = (json.credit) ? json.credit : 0;
    json.debit = (json.debit) ? json.debit : 0;

    json.purchaseId = (json.purchaseId) ? json.purchaseId : uuidv1();
    json.transactionId = (json.transactionId) ? json.transactionId : uuidv1();
    //json.purchaseUnitId = (json.purchaseUnitId) ? json.purchaseUnitId : "";
    json.from = (json.from) ? json.from : "";
    json.updated = new Date();

    return this.getLedger(json);
}

exports.getAdminWalletLedgerforPurchaseUint = function (json) {
    json.user = json.userId;
    json.walletId = constants.WT_ADMIN_WALLET_ID;
    json.wallet = constants.WT_ADMIN_WALLET;

    json.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
    json.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

    json.account = constants.AC_PURCHASE_UNITS;
    json.accountId = constants.AC_PURCHASE_UNITS_ID;

    json.credit = (json.credit) ? json.credit : 0;
    json.debit = (json.debit) ? json.debit : 0;

    json.purchaseId = (json.purchaseId) ? json.purchaseId : uuidv1();
    json.transactionId = (json.transactionId) ? json.transactionId : uuidv1();
    json.purchaseUnitId = (json.purchaseUnitId) ? json.purchaseUnitId : "";
    json.from = (json.from) ? json.from : "";

    json.updated = new Date();

    return this.getLedger(json);
}

exports.getActiveBonusWalletforPurchaseUint = function (json) {
    json.user = json.userId;
    json.walletId = constants.WT_ACTIVE_BONUS_WALLET_ID;
    json.wallet = constants.WT_ACTIVE_BONUS_WALLET;

    json.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
    json.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

    json.account = constants.AC_ACTIVE_BONUS;
    json.accountId = constants.AC_ACTIVE_BONUS_ID;

    json.credit = (json.credit) ? json.credit : 0;
    json.debit = (json.debit) ? json.debit : 0;

    json.purchaseId = (json.purchaseId) ? json.purchaseId : uuidv1();
    json.transactionId = (json.transactionId) ? json.transactionId : uuidv1();
    json.purchaseUnitId = (json.purchaseUnitId) ? json.purchaseUnitId : "";
    json.from = (json.from) ? json.from : "";

    json.updated = new Date();

    return this.getLedger(json);
}

exports.getLevelCommissionEarnedLedger = function (params) {
    var ancestors = params.purchaseJson.user.ancestor;
    var commissionLedger = [];
    var results = params.levelSponsorUsers;
    var i = 0;
    var purchaseJson = params.purchaseJson;
    var totalNoOfPoints = purchaseJson.totalNoOfPoints;
    var numberOfPoints = (totalNoOfPoints - (purchaseJson.numberOfUnits * 5))
    var points = totalNoOfPoints - numberOfPoints;

    var levelData = params.levelData;
    levelData.forEach(element => {
        var user = _.find(results, {referralCode: element.referralCode});
        if(user) {
            if (element.level == 1) {
                var credit = numberOfPoints * (element.percentage * 100 / 10000);
                commissionLedger.push(this.getLevelLedger(user, credit, params));
            } else if (element.level == 2 || element.level == 3) {
                if (element.total >= 3) {
                    var credit = numberOfPoints * (element.percentage * 100 / 10000);
                    commissionLedger.push(this.getLevelLedger(user, credit, params));
                }
            } else if (element.level == 4 || element.level == 5) {
                if (element.total >= 5) {
                    var credit = numberOfPoints * (element.percentage * 100 / 10000);
                    commissionLedger.push(this.getLevelLedger(user, credit, params));
                }
            }   
        }
        i++;
    });

    return commissionLedger;
}

exports.getLevelLedger = function(user, credit, params) {
    var json = {};
    json.userId = user._id;
    json.user = user._id;
    json.walletId = constants.WT_EARNED_WALLET_ID;
    json.wallet = constants.WT_EARNED_WALLET;

    json.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
    json.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

    json.account = constants.AC_LEVEL_COMMISSION;
    json.accountId = constants.AC_LEVEL_COMMISSION_ID;

    json.credit = credit;    
    json.debit = 0;

    json.purchaseId = (params.purchaseUnit) ? params.purchaseUnit._id : uuidv1();
    json.transactionId = (params.purchaseUnit) ? params.purchaseUnit.transactionId : uuidv1();
    json.purchaseUnitId = (params.purchaseUnit) ? params.purchaseUnit.purchaseUnitId : "";

    json.updated = new Date();
    return this.getLedger(json);
}

exports.getBinaryPayoutLedger = function(params, binaryPayout, transactionId) {
    var json = {};
    json.userId = binaryPayout.user;
    json.user = binaryPayout.user;
    json.walletId = constants.BINARY_COMMISSION_ID;
    json.wallet = constants.BINARY_COMMISSION_WALLET;

    json.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
    json.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

    json.account = constants.AC_BINARY_COMMISSION;
    json.accountId = constants.AC_BINARY_COMMISSION_ID;

    json.credit = binaryPayout.binaryPayout;
    json.debit = 0;
    //json.transferUser = {to : userPayoutDetail.userId, toUser : userPayoutDetail.userName,
        //from : userPayoutDetail.puUserId, fromUser : userPayoutDetail.puUserName},

    json.transactionId = (transactionId) ? transactionId : uuidv1();
    json.cutoffId = params.binaryCutoff._id;
    json.payoutType = constants.BINARY_PAYOUT

    json.updated = new Date();
    return this.getPayoutLedger(json);
}

exports.getSuperBinaryPayoutLedger = function(params, binaryPayout, transactionId) {
    var json = {};
    json.userId = binaryPayout.user;
    json.user = binaryPayout.user;
    json.walletId = constants.BINARY_COMMISSION_ID;
    json.wallet = constants.BINARY_COMMISSION_WALLET;

    json.accountType = constants.ACT_DEPOSIT_ACCOUNT_TYPE;
    json.accountTypeId = constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID;

    json.account = constants.AC_SUPER_BINARY_COMMISSION;
    json.accountId = constants.AC_SUPER_BINARY_COMMISSION_ID;

    json.credit = binaryPayout.superBinaryPayout;
    json.debit = 0;
    json.cutoffId = params.binaryCutoff._id;

    //json.transferUser = {to : userPayoutDetail.userId, toUser : userPayoutDetail.userName,
        //from : userPayoutDetail.puUserId, fromUser : userPayoutDetail.puUserName},

    json.transactionId = (transactionId) ? transactionId : uuidv1();
    json.cutoffId = params.binaryCutoff._id;
    json.payoutType = constants.BINARY_PAYOUT

    json.updated = new Date();
    return this.getPayoutLedger(json);
}

/*
    Trading Payout Quberos Token Ledger
*/
exports.getUserQuberosTokenTradeWalletLedger = function(param, user, userTradigPayout, userTradingLot) {
    console.info('user._id = ', user._id);
    var ledger = new Ledger({
        user: mongoose.Types.ObjectId(user._id),
        userName: user.userName,
        wallet: constants.QUBEROS_TOKEN_WALLET,
        walletId: constants.QUBEROS_TOKEN_WALLET_ID,

        accountType: constants.ACT_DEPOSIT_ACCOUNT_TYPE,
        accountTypeId: constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID,

        account: constants.AC_PURCHASE_UNITS,
        accountId: constants.AC_PURCHASE_UNITS_ID,

        credit: 0,
        debit: userTradigPayout,

        purchaseId: userTradingLot.purchaseId,
        transactionId: param.transactionId,

        purchaseUnitId: userTradingLot._id,
        from: "Trading Payout",
        type: userTradingLot.type,
        cutoffId : param.tradingCutoff._id,
        payoutType : constants.TRADING_PAYOUT
    });

    return ledger;
}

/*
    Trading Payout Lot Ledger
*/
exports.getUserQuberosTokenLotWalletLedger = function(param, user, userTradigPayout, userTradingLot) {

    console.info('user._id = ', user._id);
    var ledger = new Ledger({
        user: mongoose.Types.ObjectId(user._id),
        userName: user.userName,
        wallet: constants.LOT_WALLET_WALLET,
        walletId: constants.LOT_WALLET_ID,

        accountType: constants.ACT_DEPOSIT_ACCOUNT_TYPE,
        accountTypeId: constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID,

        account: constants.AC_LOT_BONUS,
        accountId: constants.AC_LOT_BONUS_ID,

        credit: userTradigPayout,
        debit: 0,

        purchaseId: userTradingLot.purchaseId,
        transactionId: param.transactionId,

        purchaseUnitId: userTradingLot._id,
        from: "Trading Payout",
        type: userTradingLot.type,
        cutoffId : param.tradingCutoff._id,
        payoutType : constants.TRADING_PAYOUT
    });

    return ledger;
}

/*
    Trading Payout Lot Ledger
*/
exports.getSponsorQuberosTokenCashWalletLedger = function(param, sponsor, sponsorTradingPayout, userTradingLot) {
   
    var ledger = new Ledger({
        user: mongoose.Types.ObjectId(sponsor._id),
        userName: sponsor.userName,
        wallet: constants.CASH_WALLET_WALLET,
        walletId: constants.CASH_WALLET_ID,

        accountType: constants.ACT_DEPOSIT_ACCOUNT_TYPE,
        accountTypeId: constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID,

        account: constants.AC_SILVER_BONUS,
        accountId: constants.AC_SILVER_BONUS_ID,

        credit: sponsorTradingPayout,
        debit: 0,

        purchaseId: userTradingLot.purchaseId,
        transactionId: param.transactionId,

        purchaseUnitId: userTradingLot._id,
        from: "Trading Payout",
        type: userTradingLot.type,
        cutoffId : param.tradingCutoff._id,
        payoutType : constants.TRADING_PAYOUT
    });

    return ledger;
}


/*
    Get Deposit wallet ledger
*/
exports.getDepositWalletLedger = function(param) {
    
    var deposit = param.deposit;
    var user = param.deposit.user;
    var ledger = new Ledger({
        user: mongoose.Types.ObjectId(user._id),
        userName: user.userName,
        wallet: constants.WT_TRADE_WALLET,
        walletId: constants.WT_TRADE_WALLET_ID,

        accountType: constants.ACT_DEPOSIT_ACCOUNT_TYPE,
        accountTypeId: constants.ACT_DEPOSIT_ACCOUNT_TYPE_ID,

        account: constants.AC_DEPOSIT_ACCOUNT_PURCHASE_POINTS,
        accountId: constants.AC_DEPOSIT_ACCOUNT_PURCHASE_POINTS_ID,

        credit: param.deposit.points,
        debit: 0,

        purchaseId: deposit._id,
        transactionId: param.transactionId,

        from: "Admin",
        type: "BTC Deposit"
    });

    return ledger;
}

/*
    Get Withdraw wallet ledger
*/
exports.getWithdrawWalletLedger = function(param) {
    
    var withdraw = param.withdraw;
    var user = param.withdraw.user;
    var ledger = new Ledger({
        user: mongoose.Types.ObjectId(user._id),
        userName: user.userName,
        wallet: withdraw.wallet._id,
        walletId: withdraw.wallet.walletId,

        accountType: constants.ACT_WITHDRAW_ACCOUNT_TYPE,
        accountTypeId: constants.ACT_WITHDRAW_ACCOUNT_TYPE_ID,

        account: (withdraw.wallet.id == constants.CASH_WALLET_WALLET) ? constants.AC_CASH_WALLET_WITHDRAW : constants.AC_LOT_WALLET_WITHDRAW,
        accountId: (withdraw.wallet.walletId == constants.CASH_WALLET_ID) ? constants.AC_CASH_WALLET_WITHDRAW_ID : constants.AC_LOT_WALLET_WITHDRAW_ID,

        credit: 0,
        debit: withdraw.points,

        purchaseId: param.purchaseId,
        transactionId: withdraw.transactionId,

        from: withdraw.wallet.walletName,
        type: "WITHDRAW"
    });

    return ledger;
}

exports.getTradingPayoutDetail = function(purchaseUnit) {
    var created = purchaseUnit.created;
    var tpda = new Array();
    logger.info('createddbefore calling = '+ created);
    //for (let i = 1; i <= 60; i++) {
        var DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sss';

        created.setDate(created.getDate() + 7);
        var tdp1= new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp1);
        created.setDate(created.getDate() + 7);
        var tdp2= new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp2);
        created.setDate(created.getDate() + 7);
        var tdp3= new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp3);
        created.setDate(created.getDate() + 7);
        var tdp4 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp4);
        created.setDate(created.getDate() + 7);
        var tdp5 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp5);



        created.setDate(created.getDate() + 7);
        var tdp6 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp6);
        created.setDate(created.getDate() + 7);
        var tdp7 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp7);
        created.setDate(created.getDate() + 7);
        var tdp8 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp8);
        created.setDate(created.getDate() + 7);
        var tdp9 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp9);
        created.setDate(created.getDate() + 7);
        var tdp10 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp10);


        created.setDate(created.getDate() + 7);
        var tdp11= new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp11);
        created.setDate(created.getDate() + 7);
        var tdp12= new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp12);
        created.setDate(created.getDate() + 7);
        var tdp13= new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp13);
        created.setDate(created.getDate() + 7);
        var tdp14 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp14);
        created.setDate(created.getDate() + 7);
        var tdp15 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp15);



        created.setDate(created.getDate() + 7);
        var tdp16 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp16);
        created.setDate(created.getDate() + 7);
        var tdp17 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp17);
        created.setDate(created.getDate() + 7);
        var tdp18 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp18);
        created.setDate(created.getDate() + 7);
        var tdp19 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp19);
        created.setDate(created.getDate() + 7);
        var tdp20 = new TradingPayoutDetail({
            user: purchaseUnit.user,
            numberOfUnits: purchaseUnit.numberOfUnits,
            numberOfPoints: purchaseUnit.numberOfUnits * constants.TRADING_PAYOUT_LOT_BONUS,
            purchaseId: purchaseUnit.purchaseId,
            type: purchaseUnit.type,
            creditStatus : 'UPCOMING',
            creditDate : moment(created).format(DATE_FORMAT) + 'Z'
        });
        tpda.push(tdp20);
    //}

    return tpda;
}

exports.getLevelCommissionEarnedWalletforPurchaseUint = function (ancestors, result) {

    var data = [];
    var i = 0;
    ancestors.forEach(element => {
        if(_.find(result, {_id: element.referralCode})) {
            var value = result[i];
            if (element.level == 1) {
                element.total = value.total;
                element.percentage = 3;
                element.count = 1;
                data.push(element);
            } else if (element.level == 2 || element.level == 3) {
                element.total = value.total;
                element.percentage = 2;
                element.count = 3;
                data.push(element);
            } else if (element.level == 4 || element.level == 5) {
                element.total = value.total;
                element.percentage = 2;
                element.count = 5;
                data.push(element);
            }
        }
        i++;
    });

    return data;
}

exports.getLevelUsers = function(user) {
    var path = user.ancestorPath;
    var ids = path.split('|');
    return ids;
}

exports.isAdmin = function(user) {
    return (A_USER == user._id);
}

exports.getDistanceDate = function () {
    var from = new Date();
    var currentDate = new Date();
    //cutoffDate = moment(cutoffDate).format('YYYY-MM-DD')
    from.setDate(from.getDate() + 1);
    from = moment(from).format('YYYY-MM-DD')
    //var payoutDateFrom = moment(cutoffDate).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z';
    var from = moment(from).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z';
    var date = {};
    date.from = from;
    date.currentDate = currentDate;

    return date;
}

exports.getTraceId = function() {
 
    return rTracer.id();
}

exports.sendForgotMailMessage = function(user, userJson) {
    const msg = {
        to: user.emailAddress,
        bcc: constants.INFO_GMAIL,
        from: constants.FROM_EMAIL,
        templateId: constants.FORGOT_SEND_GRID_TEMPLATE_ID,
        dynamic_template_data: {
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            password: userJson.password,
            transactionPassword: userJson.transactionPassword
        },
    };
    logger.info('Sending forgot mail');
    _sendEmail(msg);
}

exports.sendRegistrationMailMessage = function(user, userJson) {
    const msg = {
        to: user.emailAddress,
        bcc: constants.INFO_GMAIL,
        from: constants.FROM_EMAIL,
        templateId: constants.REGISTER_SEND_GRID_TEMPLATE_ID,
        dynamic_template_data: {
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        password: userJson.password,
        transactionPassword: userJson.transactionPassword,
        referralCode: user.referralCode
        },
    };
    logger.info('Sending registration mail');
    _sendEmail(msg);
}

exports.sendPointsInitiatedMail = function(user, pointsJson) {
    const msg = {
        to: constants.ADMIN_GMAIL,
        from: constants.FROM_EMAIL,
        subject: 'Quberos BTC Initiated by ' + user.userName,
        text: 'User ' + user.userName + ' initiated BTC : ' + pointsJson.value,
        html: '<strong>User ' + user.userName + ' initiated BTC : ' + pointsJson.value + ' of USD : ' + pointsJson.usd + '</strong>',
    };
    logger.info('Sending points initiated mail ');
    _sendEmail(msg);
}

exports.sendAdminPurchaseNotification = function(purchaseJson) {
    const msg = {
        to: constants.ADMIN_GMAIL,
        from: constants.FROM_EMAIL,
        subject: 'Quberos Lot Purchased by ' + purchaseJson.user.userName,
        text: 'User Lots Purchase',
        html: '<strong>' + purchaseJson.user.userName + ' Purchased ' + purchaseJson.numberOfUnits + ' Lot(s)</strong>',
    };
    logger.info('Sending purchase notification to admin');
    _sendEmail(msg);
}

exports.sendAdminBtcPurchaseNotification = function(user) {
    const msg = {
        to: constants.ADMIN_GMAIL,
        from: constants.FROM_EMAIL,
        subject: 'Quberos BTC Initiated by ' + user.userName,
        text: 'User ' + user.userName + ' initiated BTC is completed',
        html: '<strong>User ' + user.userName + ' initiated BTC is completed</strong>'
    };
    logger.info('Sending purchase btc notification to admin');
    _sendEmail(msg);
}

function _sendEmail(msg) {
    logger.info('Global config email Send : ' + global.config.system.email.send);
    logger.info('Email Message : ' + JSON.stringify(msg));
    if(global.config.system.email.send) {
        sgMail.send(msg);
    }
}