var CronJob = require('cron').CronJob
    , _ = require('lodash')
    , async = require('async')
    , moment = require('moment')
    , logger = require('../commons/logger')
    , constants = require('../commons/constants')
    , userServiceImpl = require('../service/impl/user.service.impl')
    , payoutService = require('../service/payout.service')
    , tradingPayoutService = require('../service/trading.payout.service');

var binarySchedule = (global.config.system.payout.live) ? global.config.system.payout.liveSchedule: global.config.system.payout.testSchedule;
logger.info('Binary Payout Scheduled Cron : "' + binarySchedule + '" is Live : ' + global.config.system.payout.live);

var job = new CronJob(binarySchedule, function() {
    var isSystemLive = (global.config.system.payout.live)
    logger.info('****** Payout Initiated ****** ' + new Date());
    var cutoffDate = new Date();
    var payoutDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);
    payoutDate.setDate(payoutDate.getDate());
    cutoffDate = moment(cutoffDate).format(constants.CUTOFF_DATE_FORMAT);
    payoutDate = moment(payoutDate).format(constants.CUTOFF_DATE_FORMAT);
    var payoutDateFrom = moment(cutoffDate).format(constants.PAYOUT_DATE_FORMAT) + 'Z';
    var payoutDateTo = moment(payoutDate).format(constants.PAYOUT_DATE_FORMAT) + 'Z';

    //var date = new Date(data.date.currentDate).toLocaleString('en-US', { timeZone: 'America/New_York' });
    var tradingCutoffDate = new Date();
    var tradingPayoutDate = new Date();
    tradingCutoffDate.setDate(tradingCutoffDate.getDate() - 1);
    tradingPayoutDate.setDate(tradingPayoutDate.getDate());
    tradingCutoffDate = moment(tradingCutoffDate).format(constants.CUTOFF_DATE_FORMAT);
    tradingPayoutDate = moment(tradingPayoutDate).format(constants.CUTOFF_DATE_FORMAT);
    var tradingPayoutDateFrom = moment(tradingCutoffDate).format(constants.PAYOUT_DATE_FORMAT) + 'Z';
    var tradingPayoutDateTo = moment(tradingPayoutDate).format(constants.PAYOUT_DATE_FORMAT) + 'Z';

    //payoutDateTo.setDate(payoutDate.getDate() + 1);

    //var newYork    = moment.tz(new Date(), "America/New_York");

    var payoutDateObj = {};
    payoutDateObj.cutoffDate = cutoffDate;
    payoutDateObj.payoutDateFrom = payoutDateFrom;
    payoutDateObj.payoutDateTo = payoutDateTo;

    payoutDateObj.tradingCutoffDate = tradingCutoffDate;
    payoutDateObj.tradingPayoutDateFrom = tradingPayoutDateFrom;
    payoutDateObj.tradingPayoutDateTo = tradingPayoutDateTo;

    logger.info("Payout with cutoff date : " + JSON.stringify(payoutDateObj));
    logger.info('****** Binary Payout Initiated ****** ');
    if (isSystemLive) {
        async.waterfall([
            async.apply(payoutService.executeBinaryPayout, payoutDateObj)
        ], function (err, params) {
            if (err) {
                logger.info('****** Binary Payout Completed with Error ****** : ', err);
            } else {
                logger.info('****** Binary Payout Completed ******');
            }

            logger.info('****** Trading Payout Initiated ****** ');
            async.waterfall([
                async.apply(tradingPayoutService.executeTradingPayout, payoutDateObj)
            ], function (err, params) {
                if (err) {
                    logger.info('****** Trading Payout Completed with Error ****** : ', err);
                } else {
                    logger.info('****** Trading Payout Completed ******');
                }
            });
        });
    } else {
        logger.info('System not live - Payout cannot run');
    }

}, null, true, 'America/New_York');
job.start();


// function traverseTree(node) {
//     var children = (node.children) ? node.children : null;
//     var data = node.data;
//     /*for (var i = 0; i < children.length; i++) {
//         var node = children[i];
//         console.info('Children node = ', node.id);
//         console.info('Children length = ', (node.children) ? node.children.length : 0);
//     };*/

//     console.info("id = ", data._id);
//     console.info("userName = ", data.userName);
//     console.info("position = ", data.position);
//     console.info("Lots = ", data.lots);
//     console.info("Binary Count = ", data.bCount);
//     console.info("Super Binary Count = ", data.sbCount);
//     //console.info("status = ", data.status);

//     if (children == null || data.status == constants.USER_REG_STATUS) return;
//     //console.info('Children node = ', children.id);
//     //console.info('Children length = ', (children.children) ? children.children.length : 0);
//     //console.info('data = ', data);
//     //console.info('Children data = ', children);
//     if (data.left) {
//         //console.info('child node 0 = ', children[0]);
//         traverseTree(children[0]);
//     }

//     if (data.right) {
//         //console.info('child node 1 = ', children[1]);
//         if (data.left) {
//             traverseTree(children[1]);
//         } else {
//             traverseTree(children[0]);
//         }
//     }

// }
 
function _executeTradingPayout(params, callback) {
    console.log("_executeTradingPayout")
    callback(null, params);
}
   
//task.start();