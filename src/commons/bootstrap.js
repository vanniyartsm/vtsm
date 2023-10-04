/**
 * Created by senthil on 06/07/17.
 */
var async = require('async')
    , _ = require('lodash')
    , logger = require('./logger')
    , moment = require('moment')
    , constants = require('../commons/constants')
    , User = require('../model/User')
    , Downline = require('../model/Downline')
    , DownlineStatus = require('../model/DownlineStatus')
    , baseService = require('./base.service')
    , userService = require('../service/user.service')
    , userServiceImpl = require('../service/impl/user.service.impl')
    , pointsServiceImpl = require('../service/impl/points.service.impl')
    , bootstrapServiceImpl = require('../service/impl/quberos.bootstrap.service.impl');

exports.bootstrapInit = function() {
	logger.debug('bootstrapInit');
    async.waterfall([
        _initCounter,
        //_initDownlineLots,
        //_initPopulateStatus,
        //_initDownlineStatus,
        //_bootstrapRirectReferals,
        _initMembers,
        _initUsers,
        _initAccountTypes,
        _initAccounts,
        _initWallets,
        // _loadUserData,
        _loadTestUsers
        //_loadTestData
        //_saveTradingPayoutDetail
        //_getAllPurchaseUnits,
        //_pushTradingPayoutDetail,
    ], function (err, params) {
        //cb(err, params);
        if (params.setup) {
            logger.debug('bootstrap data setup done');
            console.info('bootstrap data setup done');
        } else {
            logger.debug('bootstrap data validated');
            console.info('bootstrap data validated');
        }
    });
};

function _initDownlineLots (params, callback) {
    var docs = [];
    console.info("initiated");

    printSponsorPreorder("596c8bf65a12076ff0cc74b1", docs, 0, function (docs) {
        //console.info('docs = ', docs);
    });
}

async function printSponsorPreorder (id, docs, counter, callback) {
    const user = await User.findOne({ _id: id });
    
    if (user == null) 
        return; 
    console.info('user => ', user.userName, ' - lots => ', (user.bCount + user.sbCount));
    docs.push(user);
    counter++;
    let referralUsers = await User.find({sponsorId: user.referralCode});

    console.info('referralUsers Length = ', referralUsers.length);
    // To generate downline details data to downline table

    var popoulate = false;

    if (popoulate) {
    
        console.info("**************** User Starts = ", user.userName, " ****************");
        let lots = await _executeSponsorTreeTraversal(user);

        // if (referralUsers.length == 0) {
        //     var sponsorStatus = await _executeSponsorStatusTreeTraversal(user);
        // }
        //console.info('user lots will be : ', lots);
        console.info("**************** User Ends = ", user.userName, " ****************");
        console.info("");
        console.info("");
    } else {

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
        user.downlineLots = downlineLots;
        update.downlineLots = downlineLots;
        console.info('downline.lot = ', downlineLots);
        let updatedUser = await User.findOneAndUpdate(filter, update);
        console.info("updatedUser = ", updatedUser);
    }

    
    for(var i = 0; i < referralUsers.length; i++) {
        var referralUser = referralUsers[i];
        await printSponsorPreorder(referralUser._id, docs, counter, callback); 
    }
}

function _initPopulateStatus (callback) {
    var docs = [];

    console.info('calling pupulateDownlineStatus');
    pupulateDownlineStatus("596c8bf65a12076ff0cc74b1", docs, 0, function (docs) {
        console.info('docs count = ', docs.length);
    });
}

async function pupulateDownlineStatus (id, docs, counter, callback) {
    const user = await User.findOne({ _id: id });
    counter ++
    let referralUsers = await User.find({sponsorId: user.referralCode});
    var referralCount = referralUsers.length;
    var validRefCount = 0;

    for(var i = 0; i < referralCount; i++) {
        var referralUser = referralUsers[i];
        if (referralUser.status != constants.USER_REG_STATUS && referralUser.status != constants.USER_TRADER_STATUS) {

        }
    }

    if (referralCount == 1 && user.status == constants.USER_SILVER_TRADER_STATUS) {
        console.info('User Referral 1 = ', user.userName, " : Status = ", user.status);
        docs.push(user);
    } else if (referralCount > 1 && (user.status != constants.USER_REG_STATUS && user.status != constants.USER_TRADER_STATUS)) {
        console.info('User = ', user.userName, " : Status = ", user.status);
        docs.push(user);
        var userStatus = {};

        for(var i = 0; i < referralCount; i++) {
            var directUser = referralUsers[i];
            console.info('    --> Direct User : ', directUser.userName, " Status : ", directUser.status);
            var statusObj = await getDownlineStatusByUser(directUser, 0, {});
            userStatus[user.userName] = statusObj;
        }

        console.info('        --> userstatus : ', userStatus);
    }

    for(var i = 0; i < referralCount; i++) {
        var referralUser = referralUsers[i];
        await pupulateDownlineStatus(referralUser._id, docs, counter, callback); 
    }

    if (counter == 1) {
        callback(docs);
    }
}

async function getDownlineStatusByUser(directUser, counter, so) {
    let referralUsers = await User.find({sponsorId: directUser.referralCode});
    var referralCount = referralUsers.length;
    counter++;

    for(var i = 0; i < referralCount; i++) {
        var referralUser = referralUsers[i];
        var status = referralUser.status;
        if (status != constants.USER_REG_STATUS && status != constants.USER_TRADER_STATUS) {
            //console.info('      --> Referral User = ', referralUser.userName, " : Status = ", referralUser.status);
            if (status == constants.USER_GOLD_TRADER_STATUS) {
                so.goldTrader = ((so.goldTrader) ? so.goldTrader : 0) + 1;
            } else if (status == constants.USER_PEARL_TRADER_STATUS) {
                so.pearlTrader = ((so.pearlTrader) ? so.pearlTrader : 0) + 1;
            } else if (status == constants.USER_DIAMOND_TRADER_STATUS) {
                so.diamondTrader = ((so.diamondTrader) ? so.diamondTrader : 0) + 1;
            } else if (status == constants.USER_PLATINUM_TRADER_STATUS) {
                so.platinumTrader = ((so.platinumTrader) ? so.platinumTrader : 0) + 1;
            }
            var userStatus = await getDownlineStatusByUser(referralUser, counter, so);
        }
    }

    if (counter == 1) {
        return so;
    }
}

function _initDownlineStatus (params, callback) {
    var docs = [];

    console.info('calling _initDownlineStatus');
    sponsorDownlineStatusProcessor("596c8bf65a12076ff0cc74b1", docs, 0, function (docs) {
        //console.info('docs = ', docs);
    });
}

async function sponsorDownlineStatusProcessor (id, docs, counter, callback) {
    const user = await User.findOne({ _id: id });
    
    if (user == null) 
        return; 
    console.info('user => ', user.userName, ' - lots => ', (user.bCount + user.sbCount));
    docs.push(user);
    counter++;
    let referralUsers = await User.find({sponsorId: user.referralCode});

    var populateStatus = false;
    
    if (populateStatus) {
        console.info("**************** Sponsor Status Starts = ", user.userName, " ****************");
        console.info("Referrals = ", referralUsers.length);
        if (referralUsers.length == 0) {
            var sponsorStatus = await _executeSponsorStatusTreeTraversal(user);
        }
        console.info("**************** Sponsor Status Ends = ", user.userName, " ****************");
        console.info("");
        console.info("");
    } else {

        var lots = (user.downlineLots ? user.downlineLots : 0);
        console.info('user lots = ', lots);
        if (lots > 0 && user.status != constants.USER_REG_STATUS && user.status != constants.USER_TRADE_STATUS) {

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
          /*for(var i = 0; i < downlineStatusArray.length; i++) {
              var status = downlineStatusArray[i];
              var id = status._id;
              var count = status.count;
              

              

            //   if (id == constants.USER_PLATINUM_TRADER_STATUS) {
            //     update.status = constants.USER_PLATINUM_TRADER_STATUS;
            //     break;
            //   } else if (id == constants.USER_DIAMOND_TRADER_STATUS) {
            //     update.status = constants.USER_DIAMOND_TRADER_STATUS;
            //     break;
            //   } else if (id == constants.USER_PEARL_TRADER_STATUS) {
            //     update.status = constants.USER_PEARL_TRADER_STATUS;
            //     break;
            //   } else if (id == constants.USER_GOLD_TRADER_STATUS) {
            //     update.status = constants.USER_GOLD_TRADER_STATUS;
            //     break;
            //   }
          }*/
          console.info('update = ', update);

          if (update.status != undefined) {
              console.info('Filter = ', filter);
              console.info('Update = ', update);
              let updatedUser = await User.findOneAndUpdate(filter, update);
          }
        }
    }

    for(var i = 0; i < referralUsers.length; i++) {
        var referralUser = referralUsers[i];
        await sponsorDownlineStatusProcessor(referralUser._id, docs, counter, callback); 
    }

    //console.info('counter = ', counter);

    //var parents = await _runAsyncDirectTreeCount(user._id, [], 0, 0, {});
    //console.info('callback = ', docs);
    //callback(docs);
}

function getDocument (id) {
    var document;
    nodes.forEach(doc => { 
        if (id == doc.id) {
            //console.info('document = ', doc);
            document = doc;
        }
    });

    return document;
}

async function printPreorder (id, docs, counter, callback) {
    //const doc = await getDocument(id);
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    const user = await User.findOne({ _id: id }, query);
    
    if (user == null) 
        return; 
    console.info('user => ', user.userName);
    docs.push(user);

    counter++;
    //console.info('doc id = ', user._id , ' left = ', user.left , ' right = ', user.right, ' parent = ', user.parentId);
    if (user.left != undefined) {
       printPreorder(user.left, docs, counter);  
    }
  
    /* now recur on right subtree */
    if (user.right != undefined) {
        printPreorder(user.right, docs, counter); 
    }

    console.info('counter = ', counter);

    //var parents = await _runAsyncDirectTreeCount(user._id, [], 0, 0, {});
    //console.info('callback = ', docs);
    //callback(docs);
}

async function _executeSponsorTreeTraversal(user) {
    var lots = (user.bCount + user.sbCount);
    return await _runAsyncDirectTreeCount(user, [], 0, lots, {}, lots);
}

const _runAsyncDirectTreeCount = async (user, users, counter, lots, pu, sponsorLots) => {
    //var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    //const user = await User.findOne({ _id: id }, query);
    const filter = { referralCode: user.sponsorId };
    const sponsorUser = await User.findOne(filter);
    
    if (user && sponsorUser) {
            var downline = new Downline({
                userId : sponsorUser._id,
                userName : sponsorUser.userName,
                lot: lots,
                fromUserId : user._id,
                fromUserName : user.userName
            });
            
            let updatedDownline = await downline.save();

            counter++;
            const parent = await _runAsyncDirectTreeCount(sponsorUser, users, counter, lots, pu, sponsorLots);
    }
    //console.info('parent counter  = ', counter);
    if (counter == 1) {
        return lots;
    }
}

async function _executeSponsorStatusTreeTraversal(user) {
    var lots = (user.downlineLots ? user.downlineLots : 0);
    console.info('user = ', user.userName);
    return await _runAsyncDownlineStatus(user, [], 0, lots, {}, lots);
}


const _runAsyncDownlineStatus = async (user, users, counter, lots, pu, sponsorLots) => {
    //var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    //const user = await User.findOne({ _id: id }, query);
    const filter = { referralCode: user.sponsorId };
    const sponsorUser = await User.findOne(filter);
    
    if (user) {
            //if (lots > 0 && sponsorUser.status != constants.USER_REG_STATUS && sponsorUser.status != constants.USER_TRADE_STATUS) {
                var downlineStatus = new DownlineStatus({
                    userId : user._id,
                    userName : user.userName,
                });
    
                console.info("----------> lots : ", lots);
                console.info("----------> pu : ", pu);
                if (lots >= 200) {
                    const userFilter = { _id: user._id };
                    const update = {};

                    if (pu.diamondTrader >= 2) {
                        downlineStatus.status = constants.USER_PLATINUM_TRADER_STATUS
                        downlineStatus.statusId = 7;
                    } else if (pu.pearlTrader >= 2) {
                        downlineStatus.status = constants.USER_DIAMOND_TRADER_STATUS
                        downlineStatus.statusId = 6;
                    } else if (pu.goldTrader >= 2) {
                        downlineStatus.status = constants.USER_PEARL_TRADER_STATUS
                        downlineStatus.statusId = 5;
                    } else {
                        downlineStatus.status = constants.USER_GOLD_TRADER_STATUS
                        downlineStatus.statusId = 4;
                    }

                    update.status = downlineStatus.status;
                    update.statusId = downlineStatus.statusId;

                    let updatedDownlineStatus = await downlineStatus.save();
                    console.info("updatedDownlineStatus : ", updatedDownlineStatus);
                    //let updatedUser = await User.findOneAndUpdate(userFilter, update);
                }
    
                //if (userStatus)
                if (downlineStatus.status == constants.USER_GOLD_TRADER_STATUS) {
                    pu.goldTrader = ((pu.goldTrader) ? pu.goldTrader : 0) + 1;
                } else if (downlineStatus.status == constants.USER_PEARL_TRADER_STATUS) {
                    pu.pearlTrader = ((pu.pearlTrader) ? pu.pearlTrader : 0) + 1;
                } else if (downlineStatus.status == constants.USER_DIAMOND_TRADER_STATUS) {
                    pu.diamondTrader = ((pu.diamondTrader) ? pu.diamondTrader : 0) + 1;
                } else if (downlineStatus.status == constants.USER_PLATINUM_TRADER_STATUS) {
                    pu.platinumTrader = ((pu.platinumTrader) ? pu.platinumTrader : 0) + 1;
                }
    
                //console.info('Sponsor User : ', sponsorUser.userName ,' Current User Lots : ', currentUserLots , ' Total Lots = ', lots, ' Status = ', (update.status != undefined) ? update.status : '');
            //}
            

            counter++;
            if (sponsorUser) {
                lots = (sponsorUser.downlineLots ? sponsorUser.downlineLots : 0);
                console.info('lots = ', lots);
                const parent = await _runAsyncDownlineStatus(sponsorUser, users, counter, lots, pu, sponsorLots);
            }
    }
    //console.info('parent counter  = ', counter);
    if (counter == 1) {
        return lots;
    }
}

const _runAsyncStatusUpdate = async (user, users, counter, lots, pu) => {
    //var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    //const user = await User.findOne({ _id: id }, query);
    console.info('user --> : ', (user ? user.userName : ''))
    const filter = { referralCode: user.sponsorId };

    const sponsorUser = await User.findOne(filter);
    
    
    if (user && sponsorUser) {
        const sponsorFilter = { _id: sponsorUser._id };
        const update = {};

        console.info('lots = ', lots, ' status = ', user.status);
        if (lots > 0 && user.status != constants.USER_REG_STATUS && user.status != constants.USER_TRADE_STATUS) {

            if (lots >= 200) {
                if (pu.diamondTrader >= 2) {
                    update.status = constants.USER_PLATINUM_TRADER_STATUS
                } else if (pu.pearlTrader >= 2) {
                    update.status = constants.USER_DIAMOND_TRADER_STATUS
                } else if (pu.goldTrader >= 2) {
                    update.status = constants.USER_PEARL_TRADER_STATUS
                } else {
                    update.status = constants.USER_GOLD_TRADER_STATUS
                }
            }

            //if (userStatus)
            if (update.status == constants.USER_GOLD_TRADER_STATUS) {
                pu.goldTrader = ((pu.goldTrader) ? pu.goldTrader : 0) + 1;
            } else if (update.status == constants.USER_PEARL_TRADER_STATUS) {
                pu.pearlTrader = ((pu.pearlTrader) ? pu.pearlTrader : 0) + 1;
            } else if (update.status == constants.USER_DIAMOND_TRADER_STATUS) {
                pu.diamondTrader = ((pu.diamondTrader) ? pu.diamondTrader : 0) + 1;
            } else if (update.status == constants.USER_PLATINUM_TRADER_STATUS) {
                pu.platinumTrader = ((pu.platinumTrader) ? pu.platinumTrader : 0) + 1;
            }

            //console.info('Sponsor User : ', sponsorUser.userName ,' Current User Lots : ', currentUserLots , ' Total Lots = ', lots, ' Status = ', (update.status != undefined) ? update.status : '');
        }        
        
        let updatedUser = await User.findOneAndUpdate(filter, update);
        counter++;
        const parent = await _runAsyncStatusUpdate(sponsorUser, users, counter, lots, pu);
    }
    //console.info('parent counter  = ', counter);
    if (counter == 1) {
        return lots;
    }
}

const _runAsyncDirectTreeCount1 = async (user, users, counter, lots, pu, sponsorLots) => {
    //var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true };
    //const user = await User.findOne({ _id: id }, query);
    const filter = { referralCode: user.sponsorId };

    const sponsorUser = await User.findOne(filter);
    
    
    if (user) {
        //console.info('parent Id = ', user.parentId);
        //const sponsorUser = await User.findOne({ referralCode: user.sponsorId }, query);
        //console.info('parentUser ==== ', parentUser);

        if (sponsorUser) {
            const sponsorFilter = { _id: sponsorUser._id };
            const update = {};
        //if (user.sponsorId && user.sponsorId != "-1") {
            //console.info('user = ', user.userName, ' sponsorUser = ', sponsorUser.userName, 'user sponsorId = ', sponsorUser._id);
            // var sponsorDownlineLots = sponsorUser.downlineLots;
            // if (sponsorDownlineLots == undefined) {
            //     sponsorDownlineLots = 0;
            // }
            // var userDownlineLots = user.downlineLots;
            // if (userDownlineLots == undefined) {
            //     userDownlineLots = 0;
            // }
            // var userLot = (user.bCount + user.sbCount);
            // var userPersonalCount = (user.personalCount ? user.personalCount : 0);
            // var userTeamCount = (user.teamCount ? user.teamCount : 0);

            //var personalCount = (user.bCount + user.sbCount);
            //var teamCount = 

            //var team = user.team;

            //lots = userLot + userPersonalCount; //userLots + userDownlineLots + sponsorDownlineLots;

            //update.downlineLots = lots;

            if (lots > 0) {

                if (lots >= 200) {
                    if (pu.diamondTrader >= 2) {
                        update.status = constants.USER_PLATINUM_TRADER_STATUS
                    } else if (pu.pearlTrader >= 2) {
                        update.status = constants.USER_DIAMOND_TRADER_STATUS
                    } else if (pu.goldTrader >= 2) {
                        update.status = constants.USER_PEARL_TRADER_STATUS
                    } else {
                        update.status = constants.USER_GOLD_TRADER_STATUS
                    }
                }

                //if (userStatus)
                if (update.status == constants.USER_GOLD_TRADER_STATUS) {
                    pu.goldTrader = ((pu.goldTrader) ? pu.goldTrader : 0) + 1;
                } else if (update.status == constants.USER_PEARL_TRADER_STATUS) {
                    pu.pearlTrader = ((pu.pearlTrader) ? pu.pearlTrader : 0) + 1;
                } else if (update.status == constants.USER_DIAMOND_TRADER_STATUS) {
                    pu.diamondTrader = ((pu.diamondTrader) ? pu.diamondTrader : 0) + 1;
                } else if (update.status == constants.USER_PLATINUM_TRADER_STATUS) {
                    pu.platinumTrader = ((pu.platinumTrader) ? pu.platinumTrader : 0) + 1;
                }

                //console.info('Sponsor User : ', sponsorUser.userName ,' Current User Lots : ', currentUserLots , ' Total Lots = ', lots, ' Status = ', (update.status != undefined) ? update.status : '');
            }

            sponsorUser.status = update.status;
            
            sponsorUser.downlineLots = lots + (sponsorUser.downlineLots ? sponsorUser.downlineLots : 0);
            if (!user.processed) {
                sponsorUser.downlineLots = sponsorUser.downlineLots + sponsorLots;
            }
            update.downlineLots = sponsorUser.downlineLots;

            users.push(sponsorUser);

            console.info('Current User : ', user.userName, ' Sponsor User : ', sponsorUser.userName, ' Lots : ', lots, ' downlineLots : ', sponsorUser.downlineLots);
            console.info('Filer : ', sponsorFilter, ' Update : ', update);

            sponsorLots = (sponsorUser.bCount + sponsorUser.sbCount);

            //update.personalCount = sponsorUser.personalCount;
            //update.teamCount = sponsorUser.teamCount;

            //console.info('Current User : ', user.userName,' userLot : ', userLot ,' personalCount : ', userPersonalCount , ' Sponsor User : ', sponsorUser.userName ,' sponsorUser.personalCount : ', sponsorUser.personalCount,' sponsorUser.teamCount : ', sponsorUser.teamCount, ' Status = ', (update.status != undefined) ? update.status : '');
            //console.info('Sponsor User : ', sponsorUser.userName ,' Filer : ', sponsorFilter, ' Update : ', update);
            console.info('');
            //console.info('update.downlineLots = ', update.downlineLots);
            if (sponsorLots )
            sponsorUser.processed = true;
            update.processed = sponsorUser.processed;
            //console.info('pu = ', JSON.stringify(pu));
            let updatedSponsorUser = await User.findOneAndUpdate(sponsorFilter, update);
        //}

        
        //if (sponsorUser.position == constants.POSITION_LEFT) {
        //}
            counter++;
            const parent = await _runAsyncDirectTreeCount(sponsorUser, users, counter, lots, pu, sponsorLots);
        }
    }
    //console.info('parent counter  = ', counter);
    if (counter == 1) {
        return lots;
    }
}

function _bootstrapRirectReferals(params, callback) {
    console.info('direct referals');
    logger.debug('getting parent uers');
    var counter = 0;
    //userService.getAllUsers(function(err, users) {
    userService.getUserByUserId("5e496b61c44af9224472f3c1", function(err, u) {
        var users = [u];
            asyncForEach(users, async (user, index) => {
            //console.info("------------- User : ", user.userName, " Index : ", index), "-------------";
            _executeParentTreeTraversal(user, [], function (err, result) {
                // /console.info('result = ', result);
                logger.info('------- End --------');
                counter ++;
                console.info('counter = ', counter , " : user length = ", users.length);
                if (counter == users.length) {
                    callback(err, params);
                }
            });
        });
    })
}

async function asyncForEach(users, cb) {
    logger.info('------- Foreach Started --------');
    for (let index = 0; index < users.length; index++) {
        var user = users[index];
        //const userPayoutDetail = await BinaryPayout.find({'user': mongoose.Types.ObjectId(payoutDetail._id)}).sort({created:-1}).limit(1);
        await cb(user, index);
    }
}

async function _executeParentTreeTraversal(user, pu, cb) {
    console.info("--------------- Top User Starts = ", user.userName);
    var parents = await _runAsyncDirectTreeCount(user._id, [], 0, 0, {});
    console.info("--------------- Top User Ends = ", user.userName);
    cb(null, parents);
}


async function addTraingPayoutAsyncForEach(purchaseUnits, cb) {
    logger.info('Foreach Started');
    for (let index = 0; index < purchaseUnits.length; index++) {
        var purchaseUnit = purchaseUnits[index];
        logger.info('================================================');
        console.info('purchaseUnit = ', purchaseUnit);
        //const userResult = await User.find({_id: userTradingLot.user._id});
        //const sponsorResult = await User.find({'referralCode': userTradingLot.user.sponsorId});
        //const userLots = await User.find({ "user._id": mongoose.Types.ObjectId("5e44de0238f7be5d701edb8c"), created: {$gte: new Date(payoutDateObj.tradingPayoutDateFrom), $lt: new Date(payoutDateObj.tradingPayoutDateTo)} })
        //console.info('userResult = ', userResult);
        //console.info('sponsorResult = ', sponsorResult);
        //var user = userResult[0];
        //var sponsor = sponsorResult[0];

        //var created = purchaseUnit;
        var tradingPayoutDetailArray = baseService.getTradingPayoutDetail(purchaseUnit);

            //if (i == 60) {
        await cb(purchaseUnit, tradingPayoutDetailArray);
            //}
        //}
    }
}


function _saveTradingPayoutDetail(callback) {

    pointsServiceImpl.getAllPurchaseUnits(function(err, purchaseUnits) {
        pointsServiceImpl.saveTradingPayoutDetails(purchaseUnits, function (err, tpds) {
            console.info('===========');
        });
    });
}

function _pushTradingPayoutDetail(params, callback) {
    addTraingPayoutAsyncForEach(params.purchaseUnits, async (purchaseUnit, tradingPayoutDetailArray) => {
        logger.info('tradingPayoutDetailArray = ' + JSON.stringify(tradingPayoutDetailArray));
    });
}

function _getAllPurchaseUnits(callback) {
    var params = {};
    pointsServiceImpl.getAllPurchaseUnits(function(err, purchaseUnits) {
        //logger.info('All Purchase Units = ' + JSON.stringify(purchaseUnits));
        params.purchaseUnits = purchaseUnits;
        callback(null, params);
    });
}

function _initCounter(callback) {
	var params = {};
    userServiceImpl.getCount(function (err, count) {
        params.counter = count;
        if (count == 0) {
            userServiceImpl.bootstrapCounter(function(err, counter) {
                params.counter = counter;
                callback(null, params);
            });
        } else {
            callback(null, params);
        }
    });
}

function _initUsers(params, callback) {
    userServiceImpl.getUsersCount(function (err, count) {
        params.usersCount = count;
        if (count == 0) {
            userServiceImpl.bootstrapUserData(function(err, results) {
                params.setup = true;
                callback(null, params);
            });
        } else {
            callback(null, params);
        }
    });
}

function _initMembers(params, callback) {
    userServiceImpl.getUsersCount(function (err, count) {
        params.usersCount = count;
        if (count == 0) {
            userServiceImpl.bootstrapMemberData(function(err, results) {
                params.setup = true;
                callback(null, params);
            });
        } else {
            callback(null, params);
        }
    });
}

function _initAccountTypes(params, callback) {
    bootstrapServiceImpl.getAccountTypeCount(function (err, count) {
        params.subscriptionsCount = count;
        if (count == 0) {
            bootstrapServiceImpl.bootstrapAccountTypeData(function(err, results) {
                params.setup = true;
                callback(null, params);
            });
        } else {
            callback(null, params);
        }
    });
}

function _initAccounts(params, callback) {
    bootstrapServiceImpl.getAccountCount(function (err, count) {
        params.subscriptionsCount = count;
        if (count == 0) {
            bootstrapServiceImpl.bootstrapAccountData(function(err, results) {
                params.setup = true;
                callback(null, params);
            });
        } else {
            callback(null, params);
        }
    });
}

function _initWallets(params, callback) {
    bootstrapServiceImpl.getWalletCount(function (err, count) {
        params.subscriptionsCount = count;
        if (count == 0) {
            bootstrapServiceImpl.bootstrapWalletData(function(err, results) {
                params.setup = true;
                callback(null, params);
            });
        } else {
            callback(null, params);
        }
    });
}

function _initComponentTypes(callback) {
    var params = {};
    componentTypeServiceImpl.getComponentTypesCount(function (err, count) {
        params.componentTypeCount = count;
        if (count == 0) {
            componentTypeServiceImpl.bootstrapCTData(function(err, results) {
                params.setup = true;
                callback(null, params);
            });
        } else {
            callback(null, params);
        }
    });
}

function _loadUserData(params, callback) {
    var required = global.config.testData.required;
    if (required) {
        bootstrapServiceImpl.loadUserData(function(err, results) {
            params.users = results;
            callback(null, params);
        });
    } else {
        callback(null, params);
    }
}

function _loadTestData(params, callback) {
    var required = global.config.testData.required;
    if (required) {
        bootstrapServiceImpl.loadTestData(function(err, results) {
            params.users = results;
            callback(null, params);
        });
    } else {
        callback(null, params);
    }
}

function _loadTestUsers(params, callback) {
    var required = global.config.testData.required;
    if (required) {
        bootstrapServiceImpl.loadTestUsers(function(err, results) {
            params.users = results;
            callback(null, params);
        });
    } else {
        callback(null, params);
    }
}
