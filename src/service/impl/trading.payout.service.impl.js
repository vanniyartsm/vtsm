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
    , shortid = require('shortid')
    , constants = require('../../commons/constants')
    , logger = require('../../commons/logger')
    , baseService = require('../../commons/base.service');

const uuidv1 = require('uuid/v1');
var Counter = require('../../model/Counter');
var User = require('../../model/User');
var PurchaseUnit = require('../../model/PurchaseUnit');
var Ledger = require('../../model/Ledger');
var BinaryCutoff = require('../../model/payout/BinaryCutoff');
var TradingCutoff = require('../../model/payout/TradingCutoff');
var BinaryPayoutDetail = require('../../model/payout/BinaryPayoutDetail');
var TradingPayoutDetail = require('../../model/payout/TradingPayoutDetail');
var BinaryPayout = require('../../model/payout/BinaryPayout');

function createTradingCutoffEntry(payoutDateObj, callback) {
    var tradingCutoff = new TradingCutoff({
        cutoffDate: new Date(payoutDateObj.tradingCutoffDate),
        cutoffStatus: false,
        type: constants.TRADING_PAYOUT,
        cutoffFrom : payoutDateObj.tradingPayoutDateFrom,
        cutoffTo : payoutDateObj.tradingPayoutDateTo
    });

    tradingCutoff.save(function(err, cutoff) {
        callback(err, cutoff);
    })
}
exports.createTradingCutoffEntry = createTradingCutoffEntry;

function updateTradingCutoff(cutoff, callback) {
    logger.info('Updating curoff : '+ JSON.stringify(cutoff));
    cutoff.save(function (err, cutoffUpdate) {
        callback(err, cutoffUpdate);
    });
}
exports.updateTradingCutoff = updateTradingCutoff;

function createBinaryDetailEntry(param, callback) {
    var binaryCutoff = new BinaryCutoff({
        cutoffDate: param.cutoffDate,
        type: constants.BINARY_PAYOUT
    });

    binaryCutoff.save(function(err, cutoff) {
        callback(err, cutoff);
    })
}

exports.createBinaryDetailEntry = createBinaryDetailEntry;

// db.getCollection('binary_payout_detail  ').aggregate([
//     { $match: { userId: "5e274fffe1adb36853354287"} },
//     { $group: { _id: "$userId", puLeftBCount: { $sum: "$puLeftBCount" }, puLeftSBCount: { $sum: "$puLeftSBCount" }, puRightBCount: { $sum: "$puRightBCount" }, puRightSBCount: { $sum: "$puRightSBCount" } } }
//  ])

function getBinaryPayoutDetail(bpd, callback) {
    var query = new Array();
    query.push({ $match: { user: mongoose.Types.ObjectId(bpd.userId)} });
    query.push({ $group: { _id: "$userId", puLeftBCount: { $sum: "$puLeftBCount" }, puLeftSBCount: { $sum: "$puLeftSBCount" }, puRightBCount: { $sum: "$puRightBCount" }, puRightSBCount: { $sum: "$puRightSBCount" } } });

    BinaryPayoutDetail.aggregate(query, function (err, result) {
        callback(err, result);
    })
}
exports.getBinaryPayoutDetail = getBinaryPayoutDetail;

function getUserTradingLots(param, callback) {
    var payoutDateObj = param.payoutDateObj;
    var query = { creditDate: {$gte: new Date(payoutDateObj.tradingPayoutDateFrom), $lt: new Date(payoutDateObj.tradingPayoutDateTo)}};
    logger.info('User Trading lot payout query = ' + JSON.stringify(query));
    TradingPayoutDetail.find(query, function (err, result) {
        callback(err, result);
    });
}
exports.getUserTradingLots = getUserTradingLots;

function getSponsorTradingLotCount(param, callback) {
    var payoutDateObj = param.payoutDateObj;
    var query = new Array();
    
    query.push({ $match: { created: {$gte: new Date(payoutDateObj.tradingPayoutDateFrom), $lt: new Date(payoutDateObj.tradingPayoutDateTo)}}});
    query.push({ $group: { _id: "$user.sponsorId", numberOfUnits: { $sum: "$numberOfUnits" }, numberOfPoints: { $sum: "$numberOfPoints" } } });
    //query.push({ $match: { created: {$gte: new Date(payoutDateObj.payoutDateFrom), $lt: new Date(payoutDateObj.payoutDateTo)}}});
    //query.push({ $match: { created: {$gte: new Date("2020-01-21T00:00:00.000Z"), $lt: new Date("2020-01-22T00:00:00.000Z")}}});
    //query.push({ $group: { _id: "$userId", puLeftBCount: { $sum: "$puLeftBCount" }, puRightBCount: { $sum: "$puRightBCount" }, puLeftSBCount: { $sum: "$puLeftSBCount" }, puRightSBCount: { $sum: "$puRightSBCount" } } });
    logger.info('Sponsor Trading lot payout query = ' + JSON.stringify(query));
    PurchaseUnit.aggregate(query, function (err, result) {
        callback(err, result);
    });
}
exports.getSponsorTradingLotCount = getSponsorTradingLotCount;

function updateTradingPayoutDetails(param, callback) {
    var payoutDateObj = param.payoutDateObj

    try {
        var updateQuery = {
            "creditStatus": "CREDITED"
        };

        var findQuery = { creditDate: {$gte: new Date(payoutDateObj.tradingPayoutDateFrom), $lt: new Date(payoutDateObj.tradingPayoutDateTo)}};
        logger.info('findQuery = '+ JSON.stringify(findQuery))

        // save user to database
        TradingPayoutDetail.updateMany(findQuery, updateQuery, function (err, user) {
            callback(err, user);
        });

    } catch (err) {
        callback(err, null);
    }
}
exports.updateTradingPayoutDetails = updateTradingPayoutDetails;

async function saveBinaryPayout(binaryPayout) {
    var payout = await BinaryPayout.create(binaryPayout).exec();

    return payout;
}


async function getFirstUser(id) {
    //var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    const user = await User.findOne({ _id: id }, query).exec();
    return user;
}

const userObj = async (id) => {
    //var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    //const user = await User.findOne({ _id: id }, query);        
    var user = await getFirstUser(id);
    user.then(function(result){
        console.log(result);
        return result;
    }); 
}
exports.userObj = userObj;