/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , resEvents = require('../commons/events')
    , Utils = require('../util/util')
    , async = require('async')
    , jwt = require('jsonwebtoken')
    , passport = require('passport')
    , BaseError = require('../commons/BaseError')
    , _ = require('lodash')
    , uuidv1 = require('uuid/v1')
    , constants = require('../commons/constants')
    , logger = require('../commons/logger')
    , baseService = require('../commons/base.service')
    , userServiceImpl = require('./impl/user.service.impl')
    , payoutServiceImpl = require('./impl/payout.service.impl');

var User = require('../model/User');
var BinaryCutoff = require('../model/payout/BinaryCutoff');
var BinaryPayout = require('../model/payout/BinaryPayout');
var Ledger = require('../model/Ledger');

var isSystemLive = (global.config.system.payout.live)

exports.executeBinaryPayout = function(payoutDateObj, callback) {
    async.waterfall([
        async.apply(_createCutoffEntry, payoutDateObj),
        _fetchPayoutDetails,
        _saveCashWalletLedger,
        _updatePayout,
        _updateCutoffEntry
    ], function (err, params) {
        if(err) {
            logger.debug('Binary Payout Completed with Error : ' + JSON.stringify(err));
        }
        logger.debug('Binary Payout Execution Completed');
        callback(err, params);
    });
}

function _createCutoffEntry(payoutDateObj, callback) {
    logger.info('Cutoff Initiated');
    var param = {};
    param.payoutDateObj = payoutDateObj;

    payoutServiceImpl.createBinaryCutoffEntry(payoutDateObj, function(err, cutoffUpdate) {
        if (cutoffUpdate) {
            logger.info('Cutoff Created : ' + cutoffUpdate._id + ', Sequence Id : ' + cutoffUpdate.seqId);
        }
        param.binaryCutoff = cutoffUpdate;
        callback(err, param);
    })
}

function _fetchPayoutDetails(param, callback) {
    logger.info('Fetching Payout Details');

    payoutServiceImpl.getBinaryPayoutDetails(param, function (err, result) {
        if (result) {
            logger.info('Binary Payout Details Fetched');
        }
        param.payoutDetails = result;
        callback(err, param);
    })
}

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function asyncForEach(payoutDetails, cb) {
    logger.info('Foreach Started');
    for (let index = 0; index < payoutDetails.length; index++) {
        var payoutDetail = payoutDetails[index];
        const userPayoutDetail = await BinaryPayout.find({'user': mongoose.Types.ObjectId(payoutDetail._id)}).sort({created:-1}).limit(1);
        await cb(userPayoutDetail, index, payoutDetail);
    }
}

function _saveCashWalletLedger (param, callback) {
    logger.info('Save Cash Wallet Ledger Initiated');
    var payoutDetails = param.payoutDetails;
    var binaryPayoutArray = new Array();
    var ledgerArray = new Array();
    var carryOverArray = new Array();

    if (payoutDetails.length > 0) {
        logger.info('Total Binary Payout Details : '+ payoutDetails.length);

        asyncForEach(payoutDetails, async (userPayoutDetail, index, payoutDetail) => {

            logger.info('================================================');
            logger.info('Each User Payout Detail : ' + JSON.stringify(userPayoutDetail));
            logger.info('Each Payout Detail : ' + JSON.stringify(payoutDetail));
            var transactionId = uuidv1();
            param.transactionId = transactionId;

            logger.info('Constructing Binary Payout TransactionId : ' + transactionId);
            var binaryPayout = getBinaryPayout(param, payoutDetail, userPayoutDetail);
            if (binaryPayout.binaryPayout > 0) {
                var binaryPayoutLedger = baseService.getBinaryPayoutLedger(param, binaryPayout, transactionId);
                ledgerArray.push(binaryPayoutLedger);
            }

            if (binaryPayout.superBinaryPayout > 0) {
                var superBinaryPayoutLedger = baseService.getSuperBinaryPayoutLedger(param, binaryPayout, transactionId);
                ledgerArray.push(superBinaryPayoutLedger);
            }

            binaryPayout.transactionId = transactionId;
            binaryPayoutArray.push(binaryPayout);

            if ((payoutDetails.length - 1) == index) {
                param.binaryPayoutArray = binaryPayoutArray;
                param.ledgerArray = ledgerArray;
                logger.info('Constructed Binary Payout TransactionId : ' + transactionId);
                logger.info('----------------------------------------');
                ledgerArray.forEach(ledger => {
                    logger.info('');
                    logger.info('Each ledger = ' + JSON.stringify(ledger));
                });

                console.info('binaryPayoutArray = ', binaryPayoutArray);
                console.info('ledgerArray = ', ledgerArray);
                logger.info('----------------------------------------');
                callback(null, param);
            }
            logger.info('================================================');
        })
    }  else {
        callback(null, param);
    }
}

function _updatePayout(param, callback) {
    if (isSystemLive) {
        logger.info('Initiating Update Payout');
        BinaryPayout.create(param.binaryPayoutArray, function (err, bps){
            if (err) {
                logger.info('Error on Update Payout : ' + JSON.stringify(err));
            }
            param.binaryPayoutSaved = true;
            Ledger.create(param.ledgerArray, function (err, lds){
                param.ledgerSaved = true;
                logger.info('Payout Saved Successfully');
                callback(err, param);
            });
        });
    } else {
        logger.info('System is not live _updatePayout not saved');
    }
}

function _updateCutoffEntry(param, callback) {
    if (isSystemLive) {
        logger.info('Initiating Update CutoffEntry');
        var cutoff = param.binaryCutoff
        cutoff.cutoffStatus = true;
        cutoff.updated = new Date();
        var timeTaken = cutoff.updated.getTime() - cutoff.created.getTime(); 
        cutoff.timeTaken = timeTaken;
        logger.info('Binary Payout Total Time Taken : ' + timeTaken);
        payoutServiceImpl.updateBinaryCutoff(cutoff, function(err, cutoffUpdate) {
            param.binaryCutoff = cutoffUpdate;
            if (err) {
                logger.info('Update cutoff Error : ' + JSON.stringify(err));    
            }
            logger.info('Updated Cutoff Entry');
            callback(err, param);
        })
    } else {
        logger.info('System is not live _updateCutoffEntry not saved');
    }

}

function getBinaryPayout(param, payoutDetail, userPayoutDetail) {
    var cutoff = param.binaryCutoff;

    var binaryPayout = new BinaryPayout({
        cutoffId : cutoff._id,
        cutoffDate: cutoff.cutoffDate,
        type: constants.BINARY_PAYOUT,
        user: mongoose.Types.ObjectId(payoutDetail._id)
    });

    let leftBCarryOver = 0, rightBCarryOver = 0, leftSBCarryOver = 0, rightSBCarryOver = 0;
    logger.info('userPayoutDetail.length = ' + userPayoutDetail.length);
    var carryOver = "No";
    if(userPayoutDetail && userPayoutDetail.length > 0) {
        let upd = userPayoutDetail[0];
        
        leftBCarryOver = upd.leftBCarryOver;
        rightBCarryOver = upd.rightBCarryOver;
        leftSBCarryOver = upd.leftSBCarryOver;
        rightSBCarryOver = upd.rightSBCarryOver;

        // logger.info('leftBCarryOver : ' + leftBCarryOver);
        // logger.info('rightBCarryOver: ' + rightBCarryOver);
        // logger.info('leftSBCarryOver : ' + leftSBCarryOver);
        // logger.info('rightSBCarryOver : ' + rightSBCarryOver);
        carryOver = "Yes";
    }

    logger.info('Carry Over : ' + carryOver);
    logger.info('leftBCarryOver : ' + leftBCarryOver + ', puLeftBCount : ' + payoutDetail.puLeftBCount + ', Total puLeftBCount : ' + (payoutDetail.puLeftBCount + leftBCarryOver));
    logger.info('rightBCarryOver : ' + rightBCarryOver + ', puRightBCount : ' + payoutDetail.puRightBCount + ' Total  puRightBCount: ' + (payoutDetail.puRightBCount + rightBCarryOver));
    logger.info('leftSBCarryOver : ' + leftSBCarryOver + ', puLeftSBCount : ' + payoutDetail.puLeftSBCount + ' Total puLeftSBCount : ' + (payoutDetail.puLeftSBCount + leftSBCarryOver));
    logger.info('rightSBCarryOver : ' + rightSBCarryOver + ', puRightSBCount : ' + payoutDetail.puRightSBCount + ' Total puRightSBCount : ' + (payoutDetail.puRightSBCount + rightSBCarryOver));

    var bPayout = getPayout((payoutDetail.puLeftBCount + leftBCarryOver), (payoutDetail.puRightBCount + rightBCarryOver),
         constants.BINARY_MIN_LIMIT, constants.BINARY_MAX_LIMIT, constants.BINARY_PAYOUT);

    var sbPayout = getPayout((payoutDetail.puLeftSBCount + leftSBCarryOver), (payoutDetail.puRightSBCount + rightSBCarryOver),
            constants.SUPER_BINARY_MIN_LIMIT, constants.SUPER_BINARY_MAX_LIMIT, constants.SUPER_BINARY_PAYOUT)
   
    binaryPayout.leftBCount = payoutDetail.puLeftBCount;
    binaryPayout.rightBCount = payoutDetail.puRightBCount;
    binaryPayout.leftSBCount = payoutDetail.puLeftSBCount;
    binaryPayout.rightSBCount = payoutDetail.puRightSBCount;

    binaryPayout.leftBCarryOver = bPayout.leftCarryOver;
    binaryPayout.rightBCarryOver = bPayout.rightCarryOver;
    binaryPayout.leftSBCarryOver = sbPayout.leftCarryOver;
    binaryPayout.rightSBCarryOver = sbPayout.rightCarryOver;
    
    var binaryPair = bPayout.pair;
    var superBinaryPair = getSlabBasedSuperBinary(sbPayout);

    binaryPayout.binaryPair = binaryPair;
    binaryPayout.superBinaryPair = superBinaryPair;

    binaryPayout.binaryPayout = binaryPair * constants.BINARY_PAYOUT_RATIO;
    binaryPayout.superBinaryPayout = superBinaryPair * constants.SUPER_BINARY_PAYOUT_RATIO;
    //binaryPayout.transactionId = param.transactionId;

    logger.info('Binary Payout : ' + JSON.stringify(bPayout));
    logger.info('Super Binary Payout = ' + JSON.stringify(sbPayout));
    logger.info('Actual Payout = '+ JSON.stringify(binaryPayout));

    return binaryPayout;
}

function getSlabBasedSuperBinary(sbPayout) {
    var pair = sbPayout.pair;

    if (pair == constants.SUPER_BINARY_SLAB_8_PAIR_256) {
        pair = constants.SUPER_BINARY_SLAB_8_PAIR_256;

    } else if (pair >= constants.SUPER_BINARY_SLAB_7_PAIR_128
            && pair < constants.SUPER_BINARY_SLAB_8_PAIR_256) {
        pair = constants.SUPER_BINARY_SLAB_7_PAIR_128;

    } else if (pair >= constants.SUPER_BINARY_SLAB_6_PAIR_64
            && pair < constants.SUPER_BINARY_SLAB_7_PAIR_128) {
        pair = constants.SUPER_BINARY_SLAB_6_PAIR_64;

    } else if (pair >= constants.SUPER_BINARY_SLAB_5_PAIR_32
            && pair < constants.SUPER_BINARY_SLAB_6_PAIR_64) {
        pair = constants.SUPER_BINARY_SLAB_5_PAIR_32;

    } else if (pair >= constants.SUPER_BINARY_SLAB_4_PAIR_16
            && pair < constants.SUPER_BINARY_SLAB_5_PAIR_32) {
        pair = constants.SUPER_BINARY_SLAB_4_PAIR_16;

    } else if (pair >= constants.SUPER_BINARY_SLAB_3_PAIR_8
            && pair < constants.SUPER_BINARY_SLAB_4_PAIR_16) {
        pair = constants.SUPER_BINARY_SLAB_3_PAIR_8;

    } else if (pair >= constants.SUPER_BINARY_SLAB_2_PAIR_4
            && pair < constants.SUPER_BINARY_SLAB_3_PAIR_8) {
        pair = constants.SUPER_BINARY_SLAB_2_PAIR_4;

    } else if (pair >= constants.SUPER_BINARY_SLAB_1_PAIR_2
            && pair < constants.SUPER_BINARY_SLAB_2_PAIR_4) {
        pair = constants.SUPER_BINARY_SLAB_1_PAIR_2;
    }

    return pair;
}

function getPayout (left, right, min, max, type) {
    var payout = {};
    var pair = 0;
    var leftCarryOver = 0;
    var rightCarryOver = 0;
    var leftOver = 0;

    if (left <= min || right <= min) {
        if (left > right) {
            if (right == 0) {
                leftCarryOver = left - right;
            } else if (right == 1 && type == constants.SUPER_BINARY_PAYOUT) {
                leftCarryOver = left;
                rightCarryOver = right;
            } else {
                leftCarryOver = left - right;
                pair = right;
            }
        } else if (right > left) {
            if (left == 0) {
                rightCarryOver = right - left;
            } else if (left == 1 && type == constants.SUPER_BINARY_PAYOUT) {
                leftCarryOver = left;
                rightCarryOver = right;
            } else {
                rightCarryOver = right - left;
                pair = left;
            }
        } else {
            if (type == constants.BINARY_PAYOUT) {
                pair = left;
            } else if (type == constants.SUPER_BINARY_PAYOUT) {
                if (left == 1 && right == 1) {
                    leftCarryOver = 1;
                    rightCarryOver = 1;
                } else if (left == 2 && right == 2) {
                    pair = left;
                }
            }
        }
    } else if (left >= max && right >= max) {
        pair = max;
        if (left > right) {
            leftCarryOver = left - right;
            //leftOver = carrOver - max;
        } else if (right > left) {
            rightCarryOver = right - left;
            //leftOver = carrOver - max;
        }
    } else if (left < max || right < max) {
        if (left > right) {
            leftCarryOver = left - right;
            pair = right;
        } else if (right > left) {
            rightCarryOver = right - left;
            pair = left
        } else {
            pair = left;
        }
    } else if (left >= max || right >= max) {
        if (left > right) {
            pair = right;
            leftCarryOver = left - right;
        } else {
            pair = left
            rightCarryOver = right - left;
        }
    }

    payout.pair = pair;
    payout.leftCarryOver = leftCarryOver;
    payout.rightCarryOver = rightCarryOver;

    return payout;
}



//function _saveCashWalletLedger(param, callback) {
const _saveCashWalletLedger1 = async (param, callback) => {
    console.info('_saveCashWalletLedger');
    var payoutDetails = param.payoutDetails;
    var binaryPayoutArray = new Array();
    var ledgerArray = new Array();
    var carryOverArray = new Array();

    payoutDetails.forEach(payoutDetail => {
        console.info('-------------------------');

        console.info('payoutDetail = ', payoutDetail);
        var transactionId = uuidv1();
        param.transactionId = transactionId;

        //const user = payoutServiceImpl.userObj(payoutDetail._id);
        
        //console.info('user user user = ', user);

        var binaryPayout = getBinaryPayout(param, payoutDetail);
        if (binaryPayout.binaryPayout > 0) {
            var binaryPayoutLedger = baseService.getBinaryPayoutLedger(param, binaryPayout);
            console.info('binaryPayoutLedger = ', binaryPayoutLedger);
            ledgerArray.push(binaryPayoutLedger);
        }

        if (binaryPayout.superBinaryPayout > 0) {
            var superBinaryPayoutLedger = baseService.getSuperBinaryPayoutLedger(param, binaryPayout);
            console.info('superBinaryPayoutLedger = ', superBinaryPayoutLedger);
            ledgerArray.push(superBinaryPayoutLedger);
        }

        binaryPayoutArray.push(binaryPayout);

    });
    param.binaryPayoutArray = binaryPayoutArray;
    param.ledgerArray = ledgerArray;

    callback(null, param);
}

const _runAsyncParentTreeCount = async (id, users, counter) => {
   
}

const printString = userId => {
    
    //var user = getPayoutDetailByUser(userId, param);
    //var user = _getPayoutDetailByUser(userId, param);
    //return user;
    var user = _getPayoutDetailByUser(userId);
    return user.then(v => v);
}
//async function getPayoutDetailByUser(userId, param) {
const _getPayoutDetailByUser = async (userId) => {
    console.info('userId = ', userId);
    //const user = ;
    //console.info('userId userrrrr = ', user);
    //cb(null, user);

    /*if (user != null) {
        console.info('user object = ', user);
        user.then(function (result) {
            console.info('userrrrrr = ', user);
        });
    } else {
        console.info('user object else = ', user);
    }*/

    return await User.findOne({ user: mongoose.Types.ObjectId(userId), created: {$gte: new Date("2020-02-04T00:00:00.000Z"), $lt: new Date("2020-02-05T00:00:00.00Z")} }).exec();
}


function _fetchAllUsers(param, callback) {
    userServiceImpl.findAllUsers(function (err, users) {
        param.users = users;
        console.info('users = ', users);
        callback(null, param);
    })
}


// Binary Payout details

exports.getAllBinaryCutoffs = function(cutoffId, callback) {

    logger.info('Getting all binarycutoffs');

    payoutServiceImpl.getAllBinaryCutoffs(cutoffId, function (err, binaryCutoffs) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, err.message, 500));
            callback(baseError, binaryCutoffs);
        }

        callback(err, binaryCutoffs);
    });
};


exports.getAllTradingCutoffs = function(cutoffId, callback) {

    logger.info('Getting all tradingCutoffs');

    payoutServiceImpl.getAllTradingCutoffs(cutoffId, function (err, tradingCutoffs) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, err.message, 500));
            callback(baseError, tradingCutoffs);
        }

        callback(err, tradingCutoffs);
    });
};

exports.getPayoutByCutoffId = function(cutoffId, callback) {

    logger.info('Getting all payouts by cutoffId');

    payoutServiceImpl.getPayoutByCutoffId(cutoffId, function (err, payouts) {
        logger.info('cutoffId service payouts : ', JSON.stringify(payouts));
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, err.message, 500));
            callback(baseError, payouts);
        }

        callback(err, payouts);
    });
};