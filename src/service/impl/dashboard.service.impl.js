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

var User = require('../../model/User');
var Ledger = require('../../model/Ledger');
var Lots = require('../../model/PurchaseUnit');
var BinaryPayoutDetail = require('../../model/payout/BinaryPayoutDetail');


function getDashboardDetails (info, callback) {
    var accQuery = new Array();
    accQuery.push({$match: { user: mongoose.Types.ObjectId(info.userId)}});
    accQuery.push({$group: { _id: "$accountId", credit: { $sum: "$credit" } , debit: { $sum: "$debit" }, available: { $sum: { $subtract: [ "$credit", "$debit" ] } } } });
    accQuery.push({$lookup: { from: "account", localField: "_id", foreignField: "accountId", as: "account" }});

    var walletQuery = new Array();
    walletQuery.push({$match: { user: mongoose.Types.ObjectId(info.userId)}});
    walletQuery.push({ $group: { _id: "$walletId", credit: { $sum: "$credit" } , debit: { $sum: "$debit" }, available: { $sum: { $subtract: [ "$credit", "$debit" ] } } } });

    var result = {};
    Ledger.aggregate(accQuery,
        function (err, accountInfo) {
            //if (err) return handleError(err);
            result.accountInfo = accountInfo;

            Ledger.aggregate(walletQuery,
                function (err, walletInfo) {
                result.walletInfo = walletInfo
                callback(err, result);
            });
    })
}
exports.getDashboardDetails = getDashboardDetails;


function getWalletDetailsByUser (qo, callback) {
    var walletQuery = new Array();
    /*walletQuery.push({$match: { user: mongoose.Types.ObjectId(qo.userId)}});
    walletQuery.push({ $group: { _id: "$walletId", credit: { $sum: "$credit" } , debit: { $sum: "$debit" }, available: { $sum: { $subtract: [ "$credit", "$debit" ] } } } });
    walletQuery.push({$lookup: { from: "wallet", localField: "_id", foreignField: "walletId", as: "wallet" }});*/

    walletQuery.push({$match: { user: mongoose.Types.ObjectId(qo.userId)}});
    walletQuery.push({ $group: { _id: "$wallet", credit: { $sum: "$credit" } , debit: { $sum: "$debit" }, available: { $sum: { $subtract: [ "$credit", "$debit" ] } } } });

    var result = {};

    Ledger.aggregate(walletQuery,
        function (err, walletInfo) {
        result.walletInfo = walletInfo
        callback(err, result);
    });
}
exports.getWalletDetailsByUser = getWalletDetailsByUser;


function getLotDetailsByUser (qo, callback) {
    var lotsQuery = new Array();
    lotsQuery.push({$match: { 'user._id': mongoose.Types.ObjectId(qo.userId)}});
    lotsQuery.push({ $group: { _id: "$user", numberOfPoints: { $sum: "$numberOfPoints" } , numberOfUnits: { $sum: "$numberOfUnits" } } });

    var result = {};

    Lots.aggregate(lotsQuery,
        function (err, lotInfo) {
        if (lotInfo) {
            lotInfo = lotInfo[0];
        }
        result.lotInfo = lotInfo
        callback(err, result);
    });
}
exports.getLotDetailsByUser = getLotDetailsByUser;


// function getDownlineTree(param, callback) {
//     logger.debug('getting parent uers');
//     _executeParentTreeTraversal(param, function (err, param) {
//         callback(err, param);
//     });
// }
// exports.getDownlineTree = getDownlineTree;

const runAsyncFunctions = async (id, users, counter) => {
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightSBCount: true, puLeftSBCount: true, puRightBCount: true, bCount: true, sbCount: true  };
    const user = await User.findOne({ _id: id }, query);
    //console.info('user = ', user);
    users.push(user);
    //console.info('counter = ', counter);
    counter++;
    if (user) {
        if (user.left) {
            const left = await runAsyncFunctions(user.left, users, counter);
        }

        if (user.right) {
            const right = await runAsyncFunctions(user.right, users, counter)
        }
    }

    //return users;
    
    if (counter == 1) {
        return users;
    }
}

async function getDownlineTree(id, callback) {
    var users = await runAsyncFunctions(id, [], 0);
    //console.info('users = ', users);
    callback(null, users);
}
exports.getDownlineTree = getDownlineTree;


function getBinaryPayoutDetailsByUser(param, callback) {
    var payoutDateObj = param.payoutDateObj;
    var query = new Array();
    query.push({ $match: { 'userId': param.userId, created: {$gte: new Date(payoutDateObj.payoutDateFrom), $lt: new Date(payoutDateObj.payoutDateTo)}}});
    //query.push({ $match: { created: {$gte: new Date("2020-01-21T00:00:00.000Z"), $lt: new Date("2020-01-22T00:00:00.000Z")}}});
    query.push({ $group: { _id: "$userId", puLeftBCount: { $sum: "$puLeftBCount" }, puRightBCount: { $sum: "$puRightBCount" }, puLeftSBCount: { $sum: "$puLeftSBCount" }, puRightSBCount: { $sum: "$puRightSBCount" } } });

    logger.info('Get binary details query = ' + JSON.stringify(query));
    BinaryPayoutDetail.aggregate(query, function (err, result) {

        logger.info('Get binary details result = ', JSON.stringify(result));

        if (result && result.length > 0) {
            result = result[0];
        } else {
            result = {};
        }
        callback(err, result);
    })
}
exports.getBinaryPayoutDetailsByUser = getBinaryPayoutDetailsByUser;