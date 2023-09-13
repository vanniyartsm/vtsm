/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , moment = require('moment')
    , Utils = require('../../util/util')
    , BaseError = require('../../commons/BaseError')
    , _ = require('lodash')
    , constants = require('../../commons/constants')
    , logger = require('../../commons/logger')
    , baseService = require('../../commons/base.service');

var Support = require('../../model/general/Support');
var Faq = require('../../model/general/Faq')
var Notification = require('../../model/general/Notification');
var User = require('../../model/User');
const uuidv1 = require('uuid/v1');
const uniqid = require('uniqid')

/**
 * Save Support Ticket.
 *
 * @return {Function}
 * @api private
 */
function saveSupport(supportJson, callback) {
    var userSub = { _id: supportJson.user.userId, userName: supportJson.user.userName, sponsorId: supportJson.user.sponsorId };
    var ticketNo = "ST-" + uniqid.time().toUpperCase() + '-' + Math.floor(Math.random()*(999-100+1)+100);
    var support = new Support({
        ticketNo : ticketNo,
        user: userSub,
        subject: supportJson.subject,
        description: supportJson.description,
        reason: supportJson.reason,
        department: supportJson.department,
        initiated : true,
        status: constants.STATUS_RAISED,
        initiatedDate: new Date(),
        replied: false
    });

    // save blockchain initiate to database
    support.save(function (err) {
        callback(err, support);
    });

}
exports.saveSupport = saveSupport;

/**
 * Update Support Ticket.
 *
 * @return {Function}
 * @api private
 */
function updateSupport(supportJson, oldSupprt, callback) {
    var userSub = { _id: supportJson.user._id, userName: supportJson.user.userName, sponsorId: supportJson.user.sponsorId };
    var ticketNo = supportJson.supportTicketNo;
    var support = new Support({
        initiated: oldSupprt.initiated,
        responded: oldSupprt.responded,
        reinitiated: oldSupprt.reinitiated,
        closed: oldSupprt.closed,
        ticketNo : ticketNo,
        user: userSub,
        subject: supportJson.subject,
        description: supportJson.description,
        reason: supportJson.reason,
        department: supportJson.department
    });

    if (supportJson.reInitiated) {
        support.reinitiated = true;
        support.reinitiatedDate = new Date();
        support.status = constants.STATUS_REINITIATED;

        oldSupprt.reinitiated = true;
        oldSupprt.reinitiatedDate = new Date();
        oldSupprt.status = constants.STATUS_REINITIATED;
    } else {
        support.responded = true;
        support.respondedDate = new Date();
        support.status = constants.STATUS_RESPONDED;

        oldSupprt.responded = true;
        oldSupprt.respondedDate = new Date();
        oldSupprt.status = constants.STATUS_RESPONDED;
    }

    if (supportJson.close) {
        logger.info('closing ticket : ', oldSupprt._id);
        support.closed = supportJson.close;
        oldSupprt.closed = supportJson.close;
    }

    // save blockchain initiate to database
    support.save(function (err) {
        oldSupprt.save(function (err) {
            callback(err, support);
        });
    });

}
exports.updateSupport = updateSupport;

/**
 * Get Support Ticket by ticketNo.
 *
 * @return {Function}
 * @api private
 */
function getSupportByTicketNo(ticketNo, callback) {
    try {
        var query = { ticketNo: ticketNo };
        logger.info('Query get support ticket by ticketNo : ' + JSON.stringify(query));

        Support.findOne(query)
            .exec(function (err, deposit) {
            logger.debug("get support ticket by ticketNo err " + JSON.stringify(err));
            callback(err, deposit);
        });
    } catch (err) {
        logger.debug("get support by user err " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getSupportByTicketNo = getSupportByTicketNo;

/**
 * Get Support Ticket by id.
 *
 * @return {Function}
 * @api private
 */
function getSupportById(supportId, callback) {
    try {
        var query = { _id: mongoose.Types.ObjectId(supportId) };
        logger.info('Query get support ticket by ticketNo : ' + JSON.stringify(query));

        Support.findOne(query)
            .exec(function (err, deposit) {
            logger.debug("get support ticket by id err " + JSON.stringify(err));
            callback(err, deposit);
        });
    } catch (err) {
        logger.debug("get support by user err " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getSupportById = getSupportById;


/**
 * Get All Supports By User.
 *
 * @return {Function}
 * @api private
 */
function getAllSupportsByUser(userId, callback) {
    try {
        //var query = {status : {$nin : [constants.STATUS_RAISED, constants.STATUS_REINITIATED]}};
        var query = {"user._id" : mongoose.Types.ObjectId(userId), replied: {$eq: false}}
        logger.info('Query get all supports by user' + JSON.stringify(query));
        Support.find(query)
            .sort({created:-1})
            .exec(function (err, supports) {
            logger.debug("get all supports by user err " + JSON.stringify(err));
            callback(err, supports);
        });
    } catch (err) {
        logger.debug("get all supports by user err " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getAllSupportsByUser = getAllSupportsByUser;

/**
 * Get Supports By Support Ticket.
 *
 * @return {Function}
 * @api private
 */
function getSupportsDetails(supportTicket, callback) {
    try {
        //var query = {status : {$nin : [constants.STATUS_RAISED, constants.STATUS_REINITIATED]}};
        var query = {"ticketNo" : supportTicket}
        logger.info('Query support by supportTicket : ' + JSON.stringify(query));
        Support.find(query)
            .sort({created:-1})
            .exec(function (err, supports) {
            
            console.info('err = ', err);
            logger.debug("get supports by supportTicket " + JSON.stringify(supports));
            callback(err, supports);
        });
    } catch (err) {
        logger.debug("get supports by supportTicket err " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getSupportsDetails = getSupportsDetails;

/**
 * Get All Open Supports.
 *
 * @return {Function}
 * @api private
 */
function getAllOpenSupports(callback) {
    try {
        var query = {closed: {$ne: true}, replied: {$eq: false}};
        logger.info('Query get all open supports ' + JSON.stringify(query));
        Support.find(query)
            .sort({created:-1})
            .exec(function (err, supports) {
            logger.debug("get all open supports err " + JSON.stringify(err));
            callback(err, supports);
        });
    } catch (err) {
        logger.debug("get all supports by admin err " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getAllOpenSupports = getAllOpenSupports;

/**
 * Get All Responded and Closed Supports.
 *
 * @return {Function}
 * @api private
 */
function getAllRespondedAndClosedSupports(callback) {
    try {
        var query = {closed: {$eq: true}, replied: {$eq: false}};
        logger.info('Query get all responded and closed supports ' + JSON.stringify(query));
        Support.find(query)
            .sort({created:-1})
            .exec(function (err, supports) {
            logger.debug("get all responded and closed supports err " + JSON.stringify(err));
            callback(err, supports);
        });
    } catch (err) {
        logger.debug("get all responded and closed supports by admin err " + JSON.stringify(err));
        callback(err, null);
    }

}
exports.getAllRespondedAndClosedSupports = getAllRespondedAndClosedSupports;

/**
 * Get All Open Supports by UserId.
 *
 * @return {Function}
 * @api private
 */
function getAllOpenSupportsByUserId(userId, callback) {
    try {
        var query = {"user._id" : userId};
        logger.info('Query get all support tickets by user ' + JSON.stringify(query));
        Support.find(query)
            .sort({created:-1})
            .exec(function (err, supports) {
            logger.debug("get all supports by user err "+ JSON.stringify(err));
            callback(err, supports);
        });
    } catch (err) {
        logger.debug("get all supports by user id err "+ JSON.stringify(err));
        callback(err, null);
    }

}
exports.getAllOpenSupportsByUserId = getAllOpenSupportsByUserId;

/**
 * Respond Support Ticket by admin.
 *
 * @return {Function}
 * @api private
 */
function updateSupportRespond(supportRes, callback) {
    try {
        var updateQuery = {};

        if (supportRes.approvalStatus == constants.STATUS_RAISED) {
            updateQuery.responded = true;
            updateQuery.status = constants.STATUS_RESPONDED;
            updateQuery.respondedDate = new Date();
            updateQuery.replies = supportRes.replies;
        } else if (supportRes.approvalStatus == constants.STATUS_RESPONDED) {
            updateQuery.responded = true;
            updateQuery.status = constants.STATUS_REINITIATED;
            updateQuery.respondedDate = new Date();
            updateQuery.replies = supportRes.replies;
        } else {
            updateQuery.closed = true;
            updateQuery.closedDate = new Date();
            updateQuery.status = constants.STATUS_CLOSED;
            updateQuery.replies = supportRes.replies;
        }
        var findQuery = {
            "_id": supportRes.supportId
        }

        // update support by respond status
        Support.update(findQuery, updateQuery, function (err, result) {
            callback(err, result);
        });

    } catch (err) {
        logger.debug("updateSupportRespond err", err);
        callback(err, null);
    }

}
exports.updateSupportRespond = updateSupportRespond;