/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , resEvents = require('../../commons/events')
    , moment = require('moment')
    , Utils = require('../../util/util')
    , BaseError = require('../../commons/BaseError')
    , _ = require('lodash')
    , shortid = require('shortid')
    , constants = require('../../commons/constants')
    , baseService = require('../../commons/base.service');

var AccountType = require('../../model/AccountType');
var Account = require('../../model/Account');
var Wallet = require('../../model/Wallet');
var User = require('../../model/User');
var BlockchainInitiate = require('../../model/BlockchainInitiate');
var Ledger = require('../../model/Ledger');
var PurchaseUnit = require('../../model/PurchaseUnit');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');

function getAccountTypeCount(callback) {
    console.info("getAccountTypeCount = ");
    AccountType.countDocuments(function( err, count){
        console.info("count = ", count);
        callback(err, count);
    });
}
exports.getAccountTypeCount = getAccountTypeCount;

function bootstrapAccountTypeData(callback) {
    var depositAccountType = new AccountType({
        _id: '196c8bf65a12076ff0cc1234',
        accountTypeId: 1,
        accountTypeName: 'Deposit',
        accountTypeDesc: 'Deposit AccountType'
    });

    var wdAccountType = new AccountType({
        _id: '296c8bf65a12076ff0cc1234',
        accountTypeId: 2,
        accountTypeName: 'Withdraw',
        accountTypeDesc: 'Withdraw AccountType'
    });

    var transferAccountType = new AccountType({
        _id: '396c8bf65a12076ff0cc1234',
        accountTypeId: 3,
        accountTypeName: 'Transfer',
        accountTypeDesc: 'Transfer AccountType'
    });

    var array = [depositAccountType, wdAccountType, transferAccountType];

    AccountType.insertMany(array, function(err, accTypes) {
    	callback(err, accTypes);
    });
}
exports.bootstrapAccountTypeData = bootstrapAccountTypeData;

function getAccountCount(callback) {
    console.info("getAccountTypeCount = ");
    Account.countDocuments(function( err, count){
        console.info("count = ", count);
        callback(err, count);
    });
}
exports.getAccountCount = getAccountCount;

function bootstrapAccountData(callback) {
    var purchaseQuberos = new Account({_id: '1a1c8bf65a12076ff0cc5601', accountId: 1, accountName: 'Purchase Points', accountDesc: 'Purchase Points Using Crypto', accountTypeId: 1});
    var transferQuberos = new Account({_id: '1c1c8bf65a12076ff0cc5602', accountId: 2, accountName: 'Transfer Points', accountDesc: 'Transfer Points', accountTypeId: 3});
    var purchaseQuberosUnit = new Account({_id: '1a2c8bf65a12076ff0cc5603', accountId: 3, accountName: 'Purchase Quberos Unit', accountDesc: 'Purchase Quberos Using Crypto Unit', accountTypeId: 1});
    var earnedQuberos = new Account({_id: '1a3c8bf65a12076ff0cc5604', accountId: 4, accountName: 'Earned Quberos', accountDesc: 'Earned Quberos', accountTypeId: 1});
    var withdrawQuberos = new Account({_id: '1b1c8bf65a12076ff0cc5605', accountId: 5, accountName: 'Withdraw Quberos', accountDesc: 'Withdraw Quberos', accountTypeId: 2});
    var cancelledwQuberosUnit = new Account({_id: '1a4c8bf65a12076ff0cc5606', accountId: 6, accountName: 'Cancelled Quberos Unit', accountDesc: 'Cancelled Quberos Unit', accountTypeId: 1});

    var quberosWeeklyUnit = new Account({_id: '1a5c8bf65a12076ff0cc5607', accountId: 7, accountName: 'Quberos Token Weekly Divident', accountDesc: 'Quberos Token Weekly Divident', accountTypeId: 1});
    var sponsorCommission = new Account({_id: '1a6c8bf65a12076ff0cc5608', accountId: 8, accountName: 'Sponsor Commission', accountDesc: 'Sponsor Commision', accountTypeId: 1});
    var sponsorWeeklyBonus = new Account({_id: '1a7c8bf65a12076ff0cc5609', accountId: 9, accountName: 'Sponsor Weekly Bonus', accountDesc: 'Sponsor Weekly Bonus', accountTypeId: 1});
    var levelCommission = new Account({_id: '1a8c8bf65a12076ff0cc5610', accountId: 10, accountName: 'Level Commission', accountDesc: 'Level Commission', accountTypeId: 1});
    var weeklyLevelBonus = new Account({_id: '1a9c8bf65a12076ff0cc5611', accountId: 11, accountName: 'Weekly Level Bonus', accountDesc: 'Weekly Level Bonus', accountTypeId: 1});
    var activeBonus = new Account({_id: '1a108bf65a12076ff0cc5612', accountId: 12, accountName: 'Active Bonus', accountDesc: 'Active Bonus', accountTypeId: 1});
    var goldToken = new Account({_id: '1a118bf65a12076ff0cc5613', accountId: 13, accountName: 'Quberos Gold Token', accountDesc: 'Quberos Gold Token Based on Unit Sales', accountTypeId: 1});

    var array = [purchaseQuberos, transferQuberos, purchaseQuberosUnit, earnedQuberos, withdrawQuberos, cancelledwQuberosUnit, quberosWeeklyUnit, sponsorCommission, sponsorWeeklyBonus, levelCommission, weeklyLevelBonus, activeBonus, goldToken];

    Account.insertMany(array, function(err, accounts) {
    	callback(err, accounts);
    });
}
exports.bootstrapAccountData = bootstrapAccountData;

function getWalletCount(callback) {
    console.info("getWalletCount");
    Wallet.countDocuments(function( err, count){
        console.info("wallet count = ", count);
        callback(err, count);
    });
}
exports.getWalletCount = getWalletCount;

function bootstrapWalletData(callback) {
    var tradeWallet = new Wallet({_id: '5a1c8bf65a12076ff0cc0001', walletId: 1, walletName: 'Trade Wallet', walletDesc: 'Trade Wallet', internal: false});
    var depositWallet = new Wallet({_id: '5a2c8bf65a12076ff0cc0002', walletId: 2, walletName: 'Deposit Wallet', walletDesc: 'Deposit Wallet', internal: false});
    var earnedWallet = new Wallet({_id: '5a3c8bf65a12076ff0cc0003', walletId: 3, walletName: 'Earned Wallet', walletDesc: 'Earned Wallet', internal: false});
    var btcWallet = new Wallet({_id: '5a4c8bf65a12076ff0cc0004', walletId: 4, walletName: 'BTC Wallet', walletDesc: 'BTC Wallet', internal: true});
    var adminWallet = new Wallet({_id: '5a5c8bf65a12076ff0cc0005', walletId: 5, walletName: 'Admin Wallet', walletDesc: 'Admin Wallet', internal: true});
    var activeBonusWallet = new Wallet({_id: '5a6c8bf65a12076ff0cc0006', walletId: 6, walletName: 'Active Bonus Wallet', walletDesc: 'Active Bonus Wallet', internal: true});

    var array = [tradeWallet, depositWallet, earnedWallet, btcWallet, adminWallet, activeBonusWallet];

    Wallet.insertMany(array, function(err, wallets) {
    	callback(err, wallets);
    });
}
exports.bootstrapWalletData = bootstrapWalletData;

function loadTestData(callback) {
    var rootUserReferralCode = "2WEKAVNO";
    var userArray = new Array();
    var configure = global.config.testData.configure;
    var userReferralCode = shortid.generate().toUpperCase();
    var counter = 1;
    for (var i = 1; i <= configure.user; i++) {
        if (counter  == 10) {
            userReferralCode = shortid.generate().toUpperCase();
            counter = 1;
        }

        var user = new User({"_id" : mongoose.Types.ObjectId("5d3ec42f656b5b84a613e39" + i), userName: 'testuser' + i, password: 'password', firstName : 'Test', lastName : 'User' + i, emailAddress: 'testuser' + i  + '@quberos.com', phoneNo: '2312312335', referralCode : userReferralCode, sponsorId : rootUserReferralCode });
        userArray.push(user);
        counter++;
    }
    User.create(userArray, function(err, users) {
    	callback(err, users);
    });
}
exports.loadTestData = loadTestData;


function loadUserData(callback) {
    var zak100 = {"_id" : mongoose.Types.ObjectId("5d3ec42f656b5b84a613e39a"), "status" : true, "active" : true, "userName" : "zak100", "password" : "password", "firstName": "Zak", "lastName" : "100", "emailAddress" : "zakkkk@ggmail.com", "phoneNo" : "1231231", "sponsorId" : "2WEKAVNO", "referralCode" : "4U7DFQC9H", "ancestorPath" : "2WEKAVNO", "ancestor" : [ { "level" : 1, "referralCode" : "2WEKAVNO"}], "activatedDate" : new Date()};

    
    var zakPoints1 =
    {
        "_id" : mongoose.Types.ObjectId("5d3ecb147b82980e082b7eb0"),
        "initiated" : true, "deposited" : true, "approved" : false, "rejected" : false, "requested" : false, "requestedCancelled" : false, 
        "user" : {
            "_id" : mongoose.Types.ObjectId("5d3ec42f656b5b84a613e39a"),
            "userName" : "zak100"
        }, "address" : "1FCwuNjEKYuQcXbGwJVNtE3C5ERFT7Mbby", "addressType" : "BTC", "value" : 0.05270502, "usd" : 500, "points" : 500, "transactionHash" : "2138172381238172873128"
    }
    

    var pensen = {"_id" : mongoose.Types.ObjectId("5d3ec4d4656b5b84a613e39b"), "status" : true, "active" : false, "userName" : "pensen", "password" : "password", "firstName": "Pen", "lastName" : "Sen", "emailAddress" : "pensen@gmail.com", "phoneNo" : "123123123", "sponsorId" : "4U7DFQC9H", "referralCode" : "QXQRYPSDD", "ancestorPath" : "4U7DFQC9H|2WEKAVNO", "ancestor" : [ { "level" : 1, "referralCode" : "4U7DFQC9H" },  { "level" : 2, "referralCode" : "2WEKAVNO" }]}
    var raja = {"_id" : mongoose.Types.ObjectId("5d3ec629ca26aa039e62473a"), "status" : true, "active" : false, "userName" : "raja", "password" : "password", "firstName": "Raja", "lastName" : "R", "emailAddress" : "raja21313@ggmail.com", "phoneNo" : "13412312", "sponsorId" : "QXQRYPSDD", "referralCode" : "9E_YQP1ZP", "ancestorPath" : "QXQRYPSDD|4U7DFQC9H|2WEKAVNO", "ancestor" : [ { "level" : 1, "referralCode" : "QXQRYPSDD" },  { "level" : 2, "referralCode" : "4U7DFQC9H" }, {"level" : 3, "referralCode" : "2WEKAVNO" }]}
    var malar = {"_id" : mongoose.Types.ObjectId("5d3ec761ca26aa039e62473b"), "status" : true, "active" : false, "userName" : "malar", "password" : "password", "firstName": "Malar", "lastName" : "Vizhi", "emailAddress" : "malar123123@ggmail.com", "phoneNo" : "34343434343", "sponsorId" : "9E_YQP1ZP", "referralCode" : "I3KY0SIKO", "ancestorPath" : "9E_YQP1ZP|QXQRYPSDD|4U7DFQC9H|2WEKAVNO", "ancestor" : [ { "level" : 1, "referralCode" : "9E_YQP1ZP" },  { "level" : 2, "referralCode" : "QXQRYPSDD" }, {"level" : 3, "referralCode" : "4U7DFQC9H" }, {"level" : 4, "referralCode" : "2WEKAVNO" }]}
    var getwin = {"_id" : mongoose.Types.ObjectId("5d3ec7eaca26aa039e62473c"), "status" : true, "active" : false, "userName" : "getwin", "password" : "password",  "firstName": "Getwin", "lastName" : "100", "emailAddress" : "getwin123123@ggmail.com", "phoneNo" : "341231231", "sponsorId" : "I3KY0SIKO", "referralCode" : "5MEURATTY", "ancestorPath" : "I3KY0SIKO|9E_YQP1ZP|QXQRYPSDD|4U7DFQC9H|2WEKAVNO", "ancestor" : [ { "level" : 1, "referralCode" : "I3KY0SIKO" },  { "level" : 2, "referralCode" : "9E_YQP1ZP" }, {"level" : 3, "referralCode" : "QXQRYPSDD" }, {"level" : 4, "referralCode" : "4U7DFQC9H" },  {"level" : 5,"referralCode" : "2WEKAVNO"}]}
    var john = {"_id" : mongoose.Types.ObjectId("5d3ec84dca26aa039e62473d"), "status" : true, "active" : false, "userName" : "john", "password" : "password", "firstName": "John", "lastName" : "M", "emailAddress" : "john123@ggmail.com", "phoneNo" : "312123123", "sponsorId" : "5MEURATTY", "referralCode" : "5KQZ8BCD8", "ancestorPath" : "5MEURATTY|I3KY0SIKO|9E_YQP1ZP|QXQRYPSDD|4U7DFQC9H", "ancestor" : [ { "level" : 1, "referralCode" : "5MEURATTY" },  { "level" : 2, "referralCode" : "I3KY0SIKO" }, {"level" : 3, "referralCode" : "9E_YQP1ZP" }, {"level" : 4, "referralCode" : "QXQRYPSDD" }, { "level" : 5,"referralCode" : "4U7DFQC9H"}]}

    var userArray = [zak100, pensen, raja, malar, getwin, john];
    var pointsArray = [zakPoints1];
    var ledgerArray = this.getZakUnitPurchase();

    var pu = {"_id" : mongoose.Types.ObjectId("5d3ed05d3e1f6d1773df72a2"), "user" : {"_id" : mongoose.Types.ObjectId("5d3ec42f656b5b84a613e39a"), "userName" : "zak100", "sponsorId" : "2WEKAVNO" }, "numberOfUnits" : 1, "numberOfPoints" : 105, "purchaseId" : "8e3c41f0-b1ed-11e9-bf1a-819fc3796c76" }

    User.create(userArray, function(err, users) {
        BlockchainInitiate.create(pointsArray, function (err, bis){
            PurchaseUnit.create([pu], function(err, pus) {
                Ledger.create(ledgerArray, function (err, ls){
                    callback(err, users);
                });
            });
        });
    });
}

exports.loadUserData = loadUserData;

function getZakUnitPurchase() {
    var zakLedger1 = {"_id" : mongoose.Types.ObjectId("5d3ecb177b82980e082b7eb2"), "user" : mongoose.Types.ObjectId("5d3ec42f656b5b84a613e39a"), "wallet" : mongoose.Types.ObjectId("5a1c8bf65a12076ff0cc0001"), "walletId" : 1, "account" : mongoose.Types.ObjectId("1a1c8bf65a12076ff0cc5601"), "accountId" : 1, "accountType" : mongoose.Types.ObjectId("196c8bf65a12076ff0cc1234"), "accountTypeId" : 1, "credit" : 500, "debit" : 0, "purchaseId" : "5d3ecb147b82980e082b7eb0", "transactionId" : "139c2830-b1ec-11e9-aa9f-43a68f947a37"}
    var tradeDebitEntry = { "_id" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb32"), "user" : mongoose.Types.ObjectId("5d3ec42f656b5b84a613e39a"), "wallet" : mongoose.Types.ObjectId("5a1c8bf65a12076ff0cc0001"), "walletId" : 1, "account" : mongoose.Types.ObjectId("1a1c8bf65a12076ff0cc5601"), "accountId" : 1, "accountType" : mongoose.Types.ObjectId("196c8bf65a12076ff0cc1234"), "accountTypeId" : 1, "credit" : 0, "debit" : 105, "from" : "", "purchaseId" : "8e3c41f0-b1ed-11e9-bf1a-819fc3796c76", "transactionId" : "8e3f9d50-b1ed-11e9-bf1a-819fc3796c76", "purchaseUnitId" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb30") }
    var depositCreditEntry =  { "_id" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb33"), "user" : mongoose.Types.ObjectId("5d3ec42f656b5b84a613e39a"), "wallet" : mongoose.Types.ObjectId("5a2c8bf65a12076ff0cc0002"), "walletId" : 2, "account" : mongoose.Types.ObjectId("1a2c8bf65a12076ff0cc5603"), "accountId" : 3, "accountType" : mongoose.Types.ObjectId("196c8bf65a12076ff0cc1234"), "accountTypeId" : 1, "credit" : 100, "debit" : 0, "from" : "", "purchaseId" : "8e3c41f0-b1ed-11e9-bf1a-819fc3796c76", "transactionId" : "8e3fc460-b1ed-11e9-bf1a-819fc3796c76", "purchaseUnitId" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb30") }
    var adminCreditEntry = { "_id" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb34"), "user" : mongoose.Types.ObjectId("596c8bf65a12076ff0cc74b1"), "wallet" : mongoose.Types.ObjectId("5a5c8bf65a12076ff0cc0005"), "walletId" : 5, "account" : mongoose.Types.ObjectId("1a2c8bf65a12076ff0cc5603"), "accountId" : 4, "accountType" : mongoose.Types.ObjectId("196c8bf65a12076ff0cc1234"), "accountTypeId" : 1, "credit" : 5, "debit" : 0, "from" : "", "purchaseId" : "8e3c41f0-b1ed-11e9-bf1a-819fc3796c76", "transactionId" : "8e3feb70-b1ed-11e9-bf1a-819fc3796c76", "purchaseUnitId" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb30")}
    var activeBonusCreditEntry = { "_id" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb35"), "user" : mongoose.Types.ObjectId("596c8bf65a12076ff0cc74b1"), "wallet" : mongoose.Types.ObjectId("5a6c8bf65a12076ff0cc0006"), "walletId" : 6, "account" : mongoose.Types.ObjectId("1a108bf65a12076ff0cc5612"), "accountId" : 12, "accountType" : mongoose.Types.ObjectId("196c8bf65a12076ff0cc1234"), "accountTypeId" : 1, "credit" : 5, "debit" : 0, "from" : "", "purchaseId" : "8e3c41f0-b1ed-11e9-bf1a-819fc3796c76", "transactionId" : "8e3feb71-b1ed-11e9-bf1a-819fc3796c76", "purchaseUnitId" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb30") }
    var referralBonusEntry = { "_id" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb36"), "user" : mongoose.Types.ObjectId("596c8bf65a12076ff0cc74b1"), "wallet" : mongoose.Types.ObjectId("5a3c8bf65a12076ff0cc0003"), "walletId" : 3, "account" : mongoose.Types.ObjectId("1a3c8bf65a12076ff0cc5604"), "accountId" : 4, "accountType" : mongoose.Types.ObjectId("196c8bf65a12076ff0cc1234"), "accountTypeId" : 1, "credit" : 3, "debit" : 0, "from" : "", "purchaseId" : "8e3c41f0-b1ed-11e9-bf1a-819fc3796c76", "transactionId" : "8e3feb71-b1ed-11e9-bf1a-819fc3796c76", "purchaseUnitId" : mongoose.Types.ObjectId("5d3ecd92c28a8c12c923cb30") }

    var arr = [zakLedger1, tradeDebitEntry, depositCreditEntry, adminCreditEntry, activeBonusCreditEntry];

    return arr;
}
exports.getZakUnitPurchase = getZakUnitPurchase;