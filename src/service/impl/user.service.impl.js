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
    , uniqid = require('uniqid')
    , constants = require('../../commons/constants')
    , logger = require('../../commons/logger')
    , baseService = require('../../commons/base.service')
    , subscriptionServiceImpl = require('./subscription.service.impl')
    , async = require("async");

const uuidv1 = require('uuid/v1');
var Counter = require('../../model/Counter');
var User = require('../../model/User');
var PurchaseUnit = require('../../model/PurchaseUnit');
var Member = require('../../model/vtsm/Member');
var { PersonalInfo } = require('../../model/vtsm/PersonalInfo');
var { FamilyReligionInfo }  = require('../../model/vtsm/FamilyReligionInfo');
var { ProfessionInfo } = require('../../model/vtsm/ProfessionInfo');
var { ProfileInfo } = require('../../model/vtsm/ProfileInfo');


var Ledger = require('../../model/Ledger');
//var MailProviders = require('../../model/MailProvider');
//var UserSubscription = require('../../model/UserSubscription');
//shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');

function getUserById(id, callback) {
    User.findOne({ _id: id })
        .exec(function (err, user) {

            if (_.isEmpty(user)) {
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NAME_NOT_FOUND, '', constants.USER_NAME_NOT_FOUND_MSG, constants.USER_NAME_NOT_FOUND_MSG, 500));
                callback(baseError, user);
            } else {
                callback(err, user);
            }
        });
}

exports.getUserById = getUserById;

function getUserByUserName(userName, callback) {
    User.findOne({ userName: userName })
        .exec(function (err, user) {
            if (_.isEmpty(user)) {
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NAME_NOT_FOUND, '', constants.USER_NAME_NOT_FOUND_MSG, constants.USER_NAME_NOT_FOUND_MSG, 500));
                callback(baseError, user);
            } else {
                callback(err, user);
            }
        });
}
exports.getUserByUserName = getUserByUserName;

function getUserByEmailAddress(emailAddress, callback) {
    User.findOne({ emailAddress: emailAddress })
        .exec(function (err, user) {
            if (_.isEmpty(user)) {
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_EMAIL_NOT_FOUND, '', constants.USER_EMAIL_NOT_FOUND_MSG, constants.USER_NAME_NOT_FOUND_MSG, 500));
                callback(baseError, user);
            } else {
                callback(err, user);
            }
        });
}
exports.getUserByEmailAddress = getUserByEmailAddress;

function checkMemberByEmailAddress(emailAddress, callback) {
    Member.findOne({ emailAddress: emailAddress })
        .exec(function (err, user) {
            if (_.isEmpty(user)) {
                callback(null, false);
            } else {
                callback(null, true);
            }
        });
}
exports.checkMemberByEmailAddress = checkMemberByEmailAddress;

function checkUserByEmailAddress(emailAddress, callback) {
    User.findOne({ emailAddress: emailAddress })
        .exec(function (err, user) {
            if (_.isEmpty(user)) {
                callback(null, false);
            } else {
                callback(null, true);
            }
        });
}
exports.checkUserByEmailAddress = checkUserByEmailAddress;

function getAllUsers(callback) {
    User.find({}, function (err, users) {
        if (_.isEmpty(users)) {
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USERS_NOT_FOUND, '', constants.USERS_NOT_FOUND_MSG, constants.USERS_NOT_FOUND_MSG, 500));
            callback(baseError, users);
        } else {
            callback(err, users);
        }
    });
}

exports.getAllUsers = getAllUsers;


function getInfoUsers(callback) {
    User.find({emailAddress : constants.INFO_EMAIL}, function (err, users) {
        if (_.isEmpty(users)) {
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USERS_NOT_FOUND, '', constants.USERS_NOT_FOUND_MSG, constants.USERS_NOT_FOUND_MSG, 500));
            callback(baseError, users);
        } else {
            callback(err, users);
        }
    });
}

exports.getInfoUsers = getInfoUsers;

function getManagedUsers(callback) {
    User.find({ emailAddress: { $ne: constants.INFO_EMAIL } }, function (err, users) {
        if (_.isEmpty(users)) {
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USERS_NOT_FOUND, '', constants.USERS_NOT_FOUND_MSG, constants.USERS_NOT_FOUND_MSG, 500));
            callback(baseError, users);
        } else {
            callback(err, users);
        }
    });
}

exports.getManagedUsers = getManagedUsers;

function getAllMyDirectUsers(sponsorId, callback) {
    User.find({sponsorId : sponsorId}, function (err, users) {
        callback(err, users);
    });
}

exports.getAllMyDirectUsers = getAllMyDirectUsers;

var fetchData = function (arrayItem) {
    return new Promise(function (resolve, reject) {
        myAsyncFunction(arrayItem);
    });
};

var findData = function (userJson, callback) {
    async.parallel({
        constructUser: function (cb) {
            //_constructUser (userJson, cb);
        },
        findSponsor: function (cb) { User.find({ referralCode: userJson.sponsorId }).exec(cb); },
        findUser: function (cb) { User.find({ userName: userJson.userName }).exec(cb); }
    }, function (err, result) {
        //var ret = result.findSponsor;
        //ret.findUser = result.findUser;
        var queries = {};
        queries.constructUser = result.constructUser;
        queries.findSponsor = result.findSponsor;
        queries.findUser = result.findUser;

        callback(err, queries);
    });
}

var _findData = function (userJson, callback) {
    async.waterfall([
        function (next) {
            //ModelA.find(userInput).populate('Alpha').exec(next);
            //_constructUser(userJson, next)
        },
        function (param, next) {
            //User.find({referralCode : param.userJson.sponsorId}).exec(next);
            //     param.sponsorUser = sponsorUser;
            //     next(err, param);
            // });
            //User.find({referralCode : param.userJson.sponsorId}).exec(cb);
            // var query = User.find({referralCode : param.userJson.sponsorId});
            // var promise = query.exec();

            // promise.then(function (doc) {
            //     // use doc
            //     param.doc = doc;
            //     next(null, param);
            // });
            next(null, param);
        },
        function (param, next) {
            /* Post processing data */
            //modelAResult.dataB = modelBResult;
            next(null, param);
        }
    ], callback);
};

function _syncFunction(arrayItem, callback) {
    //console.info('arrayItem = ', arrayItem);
    async.waterfall([
        function (callback) {
            //var param = {};
            //param.one = 'one';
            _constructUser(arrayItem, callback)
            //callback(null, param);
        },
        function (param, callback) {
            // arg1 now equals 'one' and arg2 now equals 'two'
            //param.two = 'two';
            //console.info('--> two');
            /*User.find({referralCode : param.userJson.sponsorId}, function (err, sponsorUser) {
                console.info('sponsorUser = ', sponsorUser);
                callback(null, param);
            });*/
            callback(null, param);
            //_findSponsor(param, callback);
        },
        function (param, callback) {
            // arg1 now equals 'three'
            param.three = 'three';
            callback(null, param);
        }
    ], function (err, param) {
        // result now equals 'done'   
    });
}

function saveSingleMember(arrayItem, callback) {
    async.waterfall([
        async.apply(_constructMember, arrayItem),
        _saveMember,
    ], function (err, params) {
        callback(err, params);
    });
}

function saveSingleUser(arrayItem, callback) {
    async.waterfall([
        async.apply(_constructUser, arrayItem),
        _findSponsor,
        _findUser,
        _saveUser,
        _updateEndUser,
        _updateSponsorOrParent,
        _updateRightOrLeftMost,
        //_findAndUpdateMostPosition,
        //_findOneAndUpdateMostPosition,
        _updateTreeCount
        //_loadTestData
    ], function (err, params) {
        callback(err, params);
    });
}

function _constructMember(memberJson, callback) {
    //console.info('----------- Saving User -----------', userJson);
    var param = {};
    param.memberJson = memberJson;

    var familyReligionInfoSchema = new FamilyReligionInfo({
        fatherName: memberJson.fatherName,
        motherName: memberJson.motherName,
        sisters: memberJson.sisters,
        brothers: memberJson.brothers,
        rasi: memberJson.rasi,
        natchathram: memberJson.natchathram,
        lagnam: memberJson.lagnam,
        gothram: memberJson.gothram,
        dosham: memberJson.dosham
    });

    var personalInfoSchema = new PersonalInfo({
        maritalStatus: memberJson.maritalStatus,
        education: memberJson.education,
        height: memberJson.height,
        weight: memberJson.weight,
        address: memberJson.address,
        city: memberJson.city,
        state: memberJson.state,
        pincode: memberJson.pincode,
        country: memberJson.country
    });

    var professionInfoSchema = new ProfessionInfo({
        occupation: memberJson.occupation,
        employer: memberJson.employer,
        annualIncome: memberJson.annualIncome,
        workLocation: memberJson.workLocation
    });

    var profileInfoSchema = new ProfileInfo({
        description: memberJson.description,
        disabilityDesc: memberJson.disabilityDesc
    });

    var member = new Member({
        fullName: memberJson.fullName,
        emailAddress: memberJson.emailAddress,
        password: memberJson.password,
        transactionPassword: memberJson.transactionPassword,
        dob: memberJson.dateOfBirth,
        primaryMobile: memberJson.primaryMobile,
        secondaryMobile: memberJson.secondaryMobile,
        active: true,
        familyReligionInfo: familyReligionInfoSchema,
        personalInfo: personalInfoSchema,
        professionInfo: professionInfoSchema,
        profileInfo: profileInfoSchema,
        status: constants.USER_ACTIVATE_STATUS
    });

    param.member = member;
    callback(null, param);
}

function _constructUser(userJson, callback) {
    //console.info('----------- Saving User -----------', userJson);
    var param = {};
    param.userJson = userJson;

    //console.info('---- _constructUser');
    //var referralCode = shortid.generate().toUpperCase();
    var referralCode = uniqid.time().toUpperCase();

    var user = new User({
        userName: (userJson.userName) ? userJson.userName.toLowerCase() : '',
        password: userJson.password,
        transactionPassword: userJson.transactionPassword,
        firstName: userJson.firstName,
        lastName: userJson.lastName,
        emailAddress: userJson.emailAddress,
        phoneNo: userJson.phoneNo,
        sponsorId: userJson.sponsorId,
        referralCode: (userJson.referralCode) ? userJson.referralCode : referralCode,
        //ancestorPath : userJson.sponsorId,
        address: { country: userJson.country },
        position: userJson.position,
        status: constants.USER_REG_STATUS,
        bCount: 0,
        sbCount: 0,
        leftCount: 0,
        rightCount: 0,
        puLeftBCount : 0,
        puRightBCount : 0,
        puLeftSBCount : 0,
        puRightSBCount : 0,
        active: true
    });

    param.user = user;
    callback(null, param);
}

function _findSponsor(param, callback) {
    User.find({ referralCode: param.userJson.sponsorId }, function (err, sponsorUser) {
        //console.info('sponsorUser = ', sponsorUser);
        if (sponsorUser) {
            sponsorUser = sponsorUser[0];
        }

        //console.info('param.userJson sponsorUser = ', param.userJson);
        //console.info('sponsorUser after = ', param.userJson.sponsorUser);

        param.sponsorUser = sponsorUser;
        //console.info('param.sponsorUser = ', param.sponsorUser);

        if (sponsorUser != null) {
            callback(err, param);
        } else {
            var baseError = new BaseError(Utils.buildErrorResponse(constants.SPONSOR_NOT_FOUND, '', constants.SPONSOR_NOT_FOUND_MSG, constants.SPONSOR_NOT_FOUND_MSG, 500));
            callback(baseError, param);
        }
    });
}

function _findUser(param, callback) {
    User.find({ userName: param.userJson.userName.toLowerCase() }, function (err, user) {
        if (user) {
            user = user[0];
        }
        if (user == null) {
            callback(err, param);
        } else {
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_DUPLICATE, '', constants.USER_DUPLICATE_MSG, constants.USER_DUPLICATE_MSG, 500));
            callback(baseError, param);
        }
    });
}

function _saveMember(param, callback) {
    var member = param.member;

    member.save(function (err, sMember) {
        param.newMember = sMember;
        callback(err, param);
    });
}

function _saveUser(param, callback) {
    var user = param.user;
    user.sponsorName = param.sponsorUser.userName;

    user.save(function (err, sUser) {
        param.newUser = sUser;
        var userJson = param.userJson;
        var sponsorUser = param.sponsorUser;
        //var user = param.newUser;
        var queryObj = {};
        queryObj.position = sUser.position;
        queryObj.isRightPosition = (sUser.position == constants.POSITION_RIGHT) ? true : false;

        if (userJson.position == constants.POSITION_RIGHT && sponsorUser.right == null) {
            queryObj.right = sUser._id;
            queryObj.rightMost = sUser._id;
            queryObj.parentId = sponsorUser._id;
            queryObj.parent = sponsorUser;
            queryObj.sponsor = true;
            param.newUser.parentId = sponsorUser._id;
            queryObj.parent.right = sUser._id;
            queryObj.parent.rightMost = sUser._id;
            param.queryObj = queryObj;

            callback(err, param);

        } else if (userJson.position == constants.POSITION_LEFT && sponsorUser.left == null) {
            queryObj.left = sUser._id;
            queryObj.leftMost = sUser._id;
            queryObj.parentId = sponsorUser._id;
            queryObj.parent = sponsorUser;
            queryObj.sponsor = true;
            param.newUser.parentId = sponsorUser._id;
            queryObj.parent.left = sUser._id;
            queryObj.parent.leftMost = sUser._id;
            param.queryObj = queryObj;

            callback(err, param);

        } else if (userJson.position == constants.POSITION_RIGHT && sponsorUser.right != null) {
            queryObj.parentId = sponsorUser.rightMost;
            queryObj.sponsor = false;
            getUserById(queryObj.parentId, function (err, parent) {
                parent.right = sUser._id;
                parent.rightMost = sUser._id;
                param.newUser.parentId = parent._id;

                queryObj.parent = parent;
                param.queryObj = queryObj;
                callback(err, param);
            });

        } else if (userJson.position == constants.POSITION_LEFT && sponsorUser.left != null) {
            queryObj.parentId = sponsorUser.leftMost;
            queryObj.sponsor = false;
            getUserById(queryObj.parentId, function (err, parent) {
                parent.left = sUser._id;
                parent.leftMost = sUser._id;
                param.newUser.parentId = parent._id;

                queryObj.parent = parent;
                param.queryObj = queryObj;
                callback(err, param);
            });
        }

    });
}

function _updateEndUser(param, callback) {
    logger.debug('find and update most position');

    var user = param.newUser;
    user.save(function (err, updatedUser) {
        callback(err, param);
    });
}

function _updateSponsorOrParent(param, callback) {
    var parent = param.queryObj.parent;

    parent.save(function (err, updatedParent) {
        callback(err, param);
    });
}

function _updateRightOrLeftMost(param, callback) {
    var queryObj = param.queryObj;
    var query = {};

    var update = {};

    if (queryObj.isRightPosition) {
        query.rightMost = queryObj.parent._id;
        update.rightMost = param.newUser._id;
    } else {
        query.leftMost = queryObj.parent._id;
        update.leftMost = param.newUser._id;
    }

    User.updateMany(query, update, function (err, user) {
        callback(err, param);
    });
}

function _findOneAndUpdateMostPosition(param, callback) {
    logger.debug('find one and update most position');
    var queryObject = param.qo;
    var query = {};
    var update = {};
    if (queryObject.position == constants.POSITION_LEFT) {
        query._id = queryObject.value;
        update.leftMost = queryObject.currentValue;
        update.left = queryObject.currentValue;
    } else {
        query._id = queryObject.value;
        update.rightMost = queryObject.currentValue;
        update.right = queryObject.currentValue;
    }

    User.updateMany(query, update, function (err, user) {
        if (err) {
            //console.log('got an error');
            callback(err, param);
        }

        var updateQuery = {
            "parentId": queryObject.value
        };

        var findQuery = {
            "_id": queryObject.currentValue
        }

        param.newUser.parentId = queryObject.value;
        // update parentId to the current user
        User.updateOne(findQuery, updateQuery, function (err, currentUser) {
            callback(err, param);
        });
        //callback(err, {});
    });
}

//async function _updateTreeCount (param, callback) {
function _updateTreeCount(param, callback) {
    logger.debug('getting parent uers');
    _executeParentTreeTraversal(param, function (err, param) {
        callback(err, param);
    });
}

function _updateParentCount(param, callback) {

}

async function _updateParentUsers(param, cb) {
    var parentUsers = param.parentUsers;
    var userPosition = param.newUser.position;

    parentUsers.array.forEach(user => {
        user.leftCount = user.leftCount + 1;
        user.rightCount = user.leftCount + 1;
        //var updatedUser = await _runUpdateUser(user);
    });

    cb(null, param);
}

const _runUpdateUser = async (user) => {
    User.upsert({ _id: user._id }, user)
        .then((updatedUser) => {
            // here is the document
            return updatedUser;
        })
        .catch((err) => {
            // handle any save errors here
            return err;
        });
}

async function _executeParentTreeTraversal(param, cb) {
    var user = param.newUser;
    //console.info('new user = ', user);
    //console.info('------------ entered _updateTreeCount');
    var parents = await _runAsyncParentTreeCount(user._id, [], 0);
    //var parents = [];
    //console.info('parent users = ', parents);
    //console.info('------------ entered _updateTreeCount parents', callback);
    param.parentUsers = parents;
    cb(null, param);
}

const _runAsyncParentTreeCount = async (id, users, counter) => {
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true };
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
            //console.info('user.position ==== ', user.position);
            if (user.position == constants.POSITION_LEFT) {
                update.leftCount = parentUser.leftCount + 1;
            } else {
                update.rightCount = parentUser.rightCount + 1;
            }
            //console.info('update ==== ', update);
            let updatedParentUser = await User.findOneAndUpdate(filter, update);

            const parent = await _runAsyncParentTreeCount(user.parentId, users, counter);
            //console.log('parent ==== ', parent, ' counter = ', counter);
        }

    }

    if (counter == 1) {
        return users;
    }
}

function saveMultipleMember(memberArray, callback) {
    async.mapSeries(memberArray, function (memberJson) {
        saveSingleMember(memberJson, function (err, res) {
            //console.info('sending response');
            callback(err, res);
        })
    }, function (err, results) {
        callback(err, results);
    });
}
exports.saveMultipleMember = saveMultipleMember;

function saveMultipleUser(userArray, callback) {
    async.mapSeries(userArray, function (userJson) {
        saveSingleUser(userJson, function (err, res) {
            //console.info('sending response');
            callback(err, res);
        })
    }, function (err, results) {
        callback(err, results);
    });
}
exports.saveMultipleUser = saveMultipleUser;

function _myNewAsyncFunction(user, callback) {
    user.save(function (err, sUser) {
        //console.info('err = ', err);
        //console.info('sUser = ', sUser);
        callback(err, sUser);
    });
}

function saveUser(userJson, callback) {
    //var referralCode = shortid.generate().toUpperCase();
    var referralCode = uniqid.time().toUpperCase();

    var user = new User({
        userName: userJson.userName,
        password: userJson.password,
        firstName: userJson.firstName,
        lastName: userJson.lastName,
        emailAddress: userJson.emailAddress,
        phoneNo: userJson.phoneNo,
        sponsorId: userJson.sponsorId,
        referralCode: referralCode,
        //ancestorPath : userJson.sponsorId,
        address: { country: userJson.country },
        position: userJson.position,
        status: constants.USER_REG_STATUS
    });

    user.save(function (err, sUser) {
        //console.info('err = ', err);
        //console.info('sUser = ', sUser);
    });

}
exports.saveUser = saveUser;

function findAndUpdateMostPosition(queryObject, callback) {
    var query = {};
    var update = {};
    if (queryObject.position == constants.POSITION_LEFT) {
        query.leftMost = queryObject.value;
        update.leftMost = queryObject.currentValue;
    } else {
        query.rightMost = queryObject.value;
        update.rightMost = queryObject.currentValue;
    }
    //console.info('find And queryObject = ', queryObject);
    //console.info('query = ', query);
    //console.info('update = ', update);

    User.updateMany(query, update, function (err, user) {
        //console.info('updated many');
        if (err) {
            //console.log('got an error');
            callback(err, null);
        }

        callback(err, {});
    });
}

function findOneAndUpdateMostPosition(queryObject, callback) {
    var query = {};
    var update = {};
    if (queryObject.position == constants.POSITION_LEFT) {
        query._id = queryObject.value;
        update.leftMost = queryObject.currentValue;
        update.left = queryObject.currentValue;
    } else {
        query._id = queryObject.value;
        update.rightMost = queryObject.currentValue;
        update.right = queryObject.currentValue;
    }
    //console.info('fine One queryObject = ', queryObject);
    //console.info('query = ', query);
    //console.info('update = ', update);

    User.updateMany(query, update, function (err, user) {
        //console.info('updated many');
        if (err) {
            //console.log('got an error');
            callback(err, null);
        }

        var updateQuery = {
            "parentId": queryObject.value
        };

        var findQuery = {
            "_id": queryObject.currentValue
        }

        // update parentId to the current user
        User.update(findQuery, updateQuery, function (err, currentUser) {
            callback(err, currentUser);
        });
        //callback(err, {});
    });
}

function purchaseUnit(purchaseJson, callback) {
    var userSub = { _id: purchaseJson.userId, userName: purchaseJson.userName, sponsorId: purchaseJson.sponsorId };
    var purchaseUnit = new PurchaseUnit({
        user: userSub,
        numberOfUnits: purchaseJson.numberOfUnits,
        numberOfPoints: purchaseJson.numberOfPoints,
        purchaseId: purchaseJson.purchaseId,
        type: purchaseJson.type
    });

    // save user to database
    purchaseUnit.save(function (err) {
        callback(err, purchaseUnit);
    });
}
exports.purchaseUnit = purchaseUnit;

function purchaseUnits(purchaseJsonArray, callback) {
    var purchaseUnits = new Array();

    purchaseJsonArray.forEach(purchaseJson => {
        var userSub = { _id: purchaseJson.userId, userName: purchaseJson.userName, sponsorId: purchaseJson.sponsorId };
        var purchaseUnit = new PurchaseUnit({
            _id : mongoose.Types.ObjectId(),
            user: userSub,
            numberOfUnits: purchaseJson.numberOfUnits,
            numberOfPoints: purchaseJson.numberOfPoints,
            purchaseId: purchaseJson.purchaseId,
            type: purchaseJson.type
        });
        purchaseUnits.push(purchaseUnit);
    });

    // save user to database
    // purchaseUnit.save(function (err) {
    //     console.info('err = ', err);
    //     callback(err, purchaseUnit);
    // });

    PurchaseUnit.create(purchaseUnits, function(err, pus) {
    	callback(err, purchaseUnits);
    });
}
exports.purchaseUnits = purchaseUnits;

function update(user, callback) {
    user.save(user, function (err, user) {
        if (user) {
            getUserByUserName(user.username, function (err, user) {
                callback(err, user);
            })
        } else {
            callback(err, user)
        }

    });
}
exports.update = update;

function updateUserObj(user, callback) {
    logger.info('update user by user saving user');
    user.save(function (err, user) {
        if (err) {
            logger.debug('update user by user saving  Error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, constants.FATAL_ERROR_MSG, 500));
            callback(baseError, user);
        } else {
            callback(err, user)
        }
    });
}
exports.updateUserObj = updateUserObj;

function updateUserByPassword(user, callback) {
    try {
        var updateQuery = {
            "password": user.password
        };

        var findQuery = {
            "_id": user._id
        }

        // save user to database
        User.update(findQuery, updateQuery, function (err, user) {
            callback(err, user);
        });

    } catch (err) {
        callback(err, null);
    }
}
exports.updateUserByPassword = updateUserByPassword;

function updateForgotUser(user, callback) {
    logger.info('Forgot password saving user');
    user.save(function (err, user) {
        if (err) {
            logger.debug('Forgot password saving user Error : ' + JSON.stringify(err));
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, constants.FATAL_ERROR_MSG, 500));
            callback(baseError, user);
        } else {
            callback(err, user)
        }
    });
}
exports.updateForgotUser = updateForgotUser;

function updateUserByUser(user, callback) {
    try {
        var updateQuery = {
            "lots": user.lots,
            "bCount": user.bCount,
            "sbCount": user.sbCount,
            "status" : user.status,
            "updated": new Date()
        };

        var findQuery = {
            "_id": user._id
        }

        // save user to database
        User.update(findQuery, updateQuery, function (err, user) {
            callback(err, user);
        });

    } catch (err) {
        callback(err, null);
    }
}
exports.updateUserByUser = updateUserByUser;

function activateUser(user, callback) {
    try {
        var updateQuery = {
            "active": true,
            "activatedDate": new Date()
        };

        var findQuery = {
            "_id": user._id
        }

        // save user to database
        User.update(findQuery, updateQuery, function (err, user) {
            callback(err, user);
        });

    } catch (err) {
        callback(err, null);
    }
}
exports.activateUser = activateUser;

function updateUser(userJson, callback) {
    try {
        var updateQuery = {
            "firstName": userJson.firstName,
            "lastName": userJson.lastName,
            "emailAddress": userJson.emailAddress,
            "phoneNo": userJson.phoneNo
        };

        var findQuery = {
            "_id": userJson.id
        }

        // save user to database
        User.updateOne(findQuery, updateQuery, function (err, user) {
            callback(err, user);
        });

    } catch (err) {
        callback(err, null);
    }
}
exports.updateUser = updateUser;

function updateUserPath(userJson, callback) {
    try {
        var updateQuery = {
            "path": userJson.path
        };

        var findQuery = {
            "_id": userJson.id
        }

        // save user to database
        User.updateOne(findQuery, updateQuery, function (err, user) {
            callback(err, user);
        });

    } catch (err) {
        callback(err, null);
    }
}
exports.updateUserPath = updateUserPath;

function getReferralCount(ids, callback) {
    var agg = [{ $match: { sponsorId: { $in: ids }, active: true } },
    { $group: { _id: "$sponsorId", total: { $sum: 1 } } }]

    User.aggregate(agg, function (err, result) {
        callback(err, result);
    });
}
exports.getReferralCount = getReferralCount;

function getSponsorUsers(ids, callback) {
    var agg = [{ $match: { referralCode: { $in: ids }, active: true } }]

    User.aggregate(agg, function (err, result) {
        callback(err, result);
    });
}
exports.getSponsorUsers = getSponsorUsers;

function getSponsor(referralCode, callback) {
    User.findOne({ referralCode: referralCode }, function (err, user) {
        callback(err, user);
    });
}
exports.getSponsor = getSponsor;

function getSponsorBySponsorId(sponsorId, callback) {
    User.findOne({ sponsorId: sponsorId }, function (err, sponsorUser) {
        callback(err, sponsorUser);
    });
}
exports.getSponsorBySponsorId = getSponsorBySponsorId;

function updateUserBTCWalletAddress(userJson, callback) {
    try {
        var updateQuery = {
            "btcwallet": userJson.btcwallet
        };

        var findQuery = {
            "_id": userJson._id
        }

        // save user to database
        User.updateOne(findQuery, updateQuery, function (err, user) {
            callback(err, user);
        });

    } catch (err) {
        callback(err, null);
    }
}
exports.updateUserBTCWalletAddress = updateUserBTCWalletAddress;

function updateUserMailConfig(req, userJson, callback) {
    try {
        var updateQuery = {
            "senderEmailAddress": userJson.email,
        }
        updateQuery.senderEmailPassword = userJson.password;
        var findQuery = {
            "_id": req.params.id
        }

        getAllMailProvidersById(userJson.mailId, function (err, mail) {
            updateQuery.mailProvider = mail;
            User.update(findQuery, updateQuery, function (err, user) {
                if (err) {
                    callback(err, null)
                } else {
                    getUser(req, function (err, user) {
                        callback(err, user);
                    })
                }
            });
        })



        // save user to database

        /*hashPassword(userJson.password, function(err, hash) {
            if(err) {
                callback(err, null);
            } else {
                console.log("password", hash);
                updateQuery.senderEmailPassword = hash;

                // save user to database
                User.update(findQuery, updateQuery, function(err, user) {
                    callback(err, user);
                });
            }
        });*/


    } catch (err) {
        callback(err, null);
    }
}
exports.updateUserMailConfig = updateUserMailConfig;


function authenticateMember(memberJson, callback) {
    Member.findOne({ emailAddress: memberJson.emailAddress, active: true })
        .exec(function (err, member) {
            if (err) {
                logger.debug(err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500));
                callback(baseError, false, member);
            }

            if (_.isEmpty(member)) {
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NAME_NOT_FOUND, '', constants.USER_NAME_NOT_FOUND_MSG, constants.USER_NAME_NOT_FOUND_MSG, 500));
                callback(baseError, false, member);
            } else {
                console.info('Comparing');
                member.comparePassword(memberJson.password, function (err, isMatch) {
                    console.info('isMatch compared = ', isMatch);
                    callback(err, isMatch, member);
                });
            }
        });
}
exports.authenticateMember = authenticateMember;

function authenticate(userJson, callback) {
    User.findOne({ userName: userJson.userName, active: true })
        .exec(function (err, user) {
            if (err) {
                logger.debug(err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500));
                callback(baseError, false, user);
            }

            if (_.isEmpty(user)) {
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NAME_NOT_FOUND, '', constants.USER_NAME_NOT_FOUND_MSG, constants.USER_NAME_NOT_FOUND_MSG, 500));
                callback(baseError, false, user);
            } else {
                console.info('Comparing');
                user.comparePassword(userJson.password, function (err, isMatch) {
                    console.info('isMatch compared = ', isMatch);
                    callback(err, isMatch, user);
                });
            }
        });
}
exports.authenticate = authenticate;

function checkPassword(id, userJson, callback) {
    User.findOne({ _id: id })
        .populate({ path: 'userSubscription', populate: { path: 'subscription' } })
        .populate({ path: 'mailProvider' })
        .exec(function (err, user) {
            if (err) {
                logger.debug(err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500));
                callback(baseError, false, user);
            }

            if (_.isEmpty(user)) {
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NAME_NOT_FOUND, '', constants.USER_NAME_NOT_FOUND_MSG, constants.USER_NAME_NOT_FOUND_MSG, 500));
                callback(baseError, false, user);
            } else {
                user.comparePassword(userJson.oldPassword, function (err, isMatch) {
                    callback(err, isMatch, user);
                });
            }
        });
}
exports.checkPassword = checkPassword;

function updateUserPassword(req, userJson, callback) {
    try {

        var findQuery = {
            "_id": req.params.id
        }
        hashPassword(userJson.password, function (err, hash) {
            if (err) {
                callback(err, null);
            } else {
                var updateQuery = {
                    "password": hash,
                };

                User.update(findQuery, updateQuery, function (err, user) {
                    callback(err, user);
                });
            }

        })
    } catch (err) {
        logger.debug("err", err);
    }
}
exports.updateUserPassword = updateUserPassword;

function getUsersCount(callback) {
    User.countDocuments(function (err, count) {
        console.info("count = ", count);
        callback(err, count);
    })
}
exports.getUsersCount = getUsersCount;

function getUsersByIds(ids, callback) {
    User.find({ referralCode: { $in: ids } }, function (err, result) {
        callback(err, result);
    })
}
exports.getUsersByIds = getUsersByIds;

function bootstrapMemberData(callback) {

    var familyReligionInfoSchema = new FamilyReligionInfo({
        _id: '596c8bf65a12076ee0cc7590',
        fatherName: 'Father',
        motherName: 'Mother',
        sisters: 0,
        brothers: 0,
        rasi: 'Leo',
        natchathram: 'Aswini',
        lagnam: 'Leo',
        gothram: 'g',
        dosham: 'd'
    });

    var personalInfoSchema = new PersonalInfo({
        _id: '596c8bf65a12076ee0cc7591',
        maritalStatus: 'NeverMarried',
        education: 'MCA',
        height: 5.7,
        weight: 70,
        address: '1st Main Road',
        city: 'Tiruvannamalai',
        pincode: '606606',
        country: 'IN'
    });

    var professionInfoSchema = new ProfessionInfo({
        _id: '596c8bf65a12076ee0cc7592',
        occupation: 'IT',
        employer: 'Business',
        annualIncome: 10000,
        workLocation: 'Chennai'
    });

    var profileInfoSchema = new ProfileInfo({
        _id: '596c8bf65a12076ee0cc7593',
        description: '',
        isDisdisabilityDesc: ''
    });

    var member = new Member({
        _id: '596c8bf65a12076ff0cc7589',
        fullName: 'Admin User',
        emailAddress: 'admin@vtsm.com',
        password: 'MindBlowing@2030',
        transactionPassword: 'MindBlowing@2030',
        dob: '1990-10-10',
        primaryMobile: '1231231232',
        secondaryMobile: '1231231233',
        active: true,
        familyReligionInfo: familyReligionInfoSchema,
        personalInfo: personalInfoSchema,
        professionInfo: professionInfoSchema,
        profileInfo: profileInfoSchema,
        status: constants.USER_ACTIVATE_STATUS
    });

    member.save(function (err) {
        console.info('user error = ', err);
        callback(err, member);
    });
}
exports.bootstrapMemberData = bootstrapMemberData;


function bootstrapUserData(callback) {

    var user = new User({
        _id: '596c8bf65a12076ff0cc74b1',
        userName: 'vtsm',
        password: 'BlackPepper@2220',
        transactionPassword: 'TransBlackPepper@2220',
        //password: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        emailAddress: 'admin@vtsm.com',
        phoneNo: '+911231231234',
        referralCode: "2WEKAVNO",
        sponsorId: "-1",
        sponsorName: "None",
        active: true,
        //ancestorPath : "-1",
        activatedDate: new Date(),
        address: { country: 'IN' },
        //left: "5d3ec42f656b5b84a613e39a",
        //leftMost: "5d3ec4d4656b5b84a613e39b",
        //right: "5d3ec84dca26aa039e62473e",
        //rightMost : "5d3ec84dca26aa039e62473f",
        position: "-1",
        parentId: "-1",
        bCount: 0,
        sbCount: 0,
        leftCount: 0,
        rightCount: 0,
        puLeftBCount : 0,
        puRightBCount : 0,
        puLeftSBCount : 0,
        puRightSBCount : 0,
        lots: [],
        status: constants.USER_REG_STATUS
    });

    user.save(function (err) {
        console.info('user error = ', err);
        callback(err, user);
    });
}
exports.bootstrapUserData = bootstrapUserData;

function hashPassword(password, callback) {
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) {
            callback(err, null);
        } else {
            bcrypt.hash(password, salt, function (err, hash) {
                callback(err, hash)
            });
        }

    });

}

function getAllMailProviders(callback) {
    MailProviders.find({ "status": "true" }, function (err, subscriptions) {
        callback(err, subscriptions);
    });
}

exports.getAllMailProviders = getAllMailProviders;


function getAllMailProvidersById(id, callback) {
    MailProviders.findOne({ _id: id }, function (err, mail) {
        callback(err, mail);
    });
}

exports.getAllMailProvidersById = getAllMailProvidersById;

function getCount(callback) {
    Counter.countDocuments(function (err, count) {
        console.info('counter documents = ', count);
        callback(err, count);
    })
}
exports.getCount = getCount;

function bootstrapCounter(callback) {

    var counter = {};

    var userCounter = new Counter({
        _id: '59678bf65a12076ff0cc7891',
        type: constants.COUNTER_USER,
        seq: 0
    });
    counter.userCounter = userCounter;

    var binaryPayoutCounter = new Counter({
        _id: '59678bf65a12076ff0cc7892',
        type: constants.COUNTER_BINARY_PAYOUT,
        seq: 0
    });
    counter.binaryPayoutCounter = binaryPayoutCounter;

    var tradingPayoutCounter = new Counter({
        _id: '59678bf65a12076ff0cc7893',
        type: constants.COUNTER_TRADING_PAYOUT,
        seq: 0
    });
    counter.tradingPayoutCounter = tradingPayoutCounter;

    userCounter.save(function (uErr) {
        binaryPayoutCounter.save(function (bErr) {
            tradingPayoutCounter.save(function (tErr) {
                console.info('counter error = ', tErr);
                callback(tErr, counter);
            });
        });
    });
}
exports.bootstrapCounter = bootstrapCounter;

function findAllUsers(callback) {
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, active: true, status: true, lots: true, bCount: true, sbCount: true };
    //User.find({}, query);

    User.find({}, query, function (err, users) {
        //console.info('users = ', users);
        callback(err, users);
    });
}
exports.findAllUsers = findAllUsers;

const runAsyncFunctions = async (id, users, counter) => {
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightSBCount: true, puLeftSBCount: true, puRightBCount: true, bCount: true, sbCount: true, downlineLots: true };
    const user = await User.findOne({ _id: id }, query);
    //console.info('user = ', user);
    users.push(user);
    //console.info('counter = ', counter);
    counter++;
    if (user) {
        if (user.left) {
            const left = await runAsyncFunctions(user.left, users, counter);
            //console.log('left = ', left, counter)
        }

        if (user.right) {
            const right = await runAsyncFunctions(user.right, users, counter)
            //console.log('right = ', right, counter);
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

async function getSponsorTree(id, callback) {
    //console.info('Calling Sponsor Async');
    var users = await getSponsorTreeDetails(id, [], 0);
    callback(null, users);
}
exports.getSponsorTree = getSponsorTree;


async function asyncForEach(directUsers, cb) {
    //logger.info('------- Foreach Started --------');
    for (let index = 0; index < directUsers.length; index++) {
        var user = directUsers[index];
        //const userPayoutDetail = await BinaryPayout.find({'user': mongoose.Types.ObjectId(payoutDetail._id)}).sort({created:-1}).limit(1);
        await cb(user, index);
    }
}

async function getSponsorTreeDetails (id, docs, counter) {
    //const doc = await getDocument(id);
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightBCount: true, puLeftSBCount: true, puRightSBCount: true, downlineLots: true   };
    const user = await User.findOne({ _id: id }, query);
    
    if (user == null) 
        return; 
    //console.info('user => ', user.userName, ' - lots => ', (user.bCount + user.sbCount));
    docs.push(user);

    counter++;
    //console.info('doc id = ', user._id , ' left = ', user.left , ' right = ', user.right, ' parent = ', user.parentId);
    //console.info("**************** User Starts = ", user.userName, " ****************");
    let referralUsers = await User.find({sponsorId: user.referralCode});
    //console.info('referralUsers = ', (referralUsers) ? referralUsers.length : 0);
    for(var i = 0; i < referralUsers.length; i++) {
        var referralUser = referralUsers[i];
        var d = await getSponsorTreeDetails(referralUser._id, docs, counter); 
    }

    //console.info('counter = ', counter, ' User : ', user.userName);

    //var parents = await _runAsyncDirectTreeCount(user._id, [], 0, 0, {});
    //console.info('callback = ', docs);
    if (counter == 1) {
        return docs;
    }
    //callback(docs);
}

const runSponsorAsyncFunctions = async (referralCode, users, counter) => {
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightSBCount: true, puLeftSBCount: true, puRightBCount: true, bCount: true, sbCount: true  };
    const user = await User.findOne({ referralCode: referralCode }, query);
    console.info('user = ', user.userName);
    users.push(user);
    //console.info('counter = ', counter);
    counter++;
    if (user) {
        var directUsers = await User.find({sponsorId : referralCode}).exec();
        //console.info('directUsers = ', JSON.stringify(directUsers));
        asyncForEach(directUsers, async (user, index) => {
            await runSponsorAsyncFunctions(user.referralCode, users, counter);
        });
        
    }

    //return users;
    console.info('counter = ', counter);
    if (counter == 1) {
        return users;
    }
}


async function getDownlineTree1(id, callback) {
    const user = await User.findOne({ _id: id });
    var docs = [];
    var x = await listObjects1(id, user.rightMost, docs);
    callback(null, x);
}
exports.getDownlineTree1 = getDownlineTree1;

function getLotCountBySponsor(qo, callback) {
    var lotCountQuery = new Array();
    lotCountQuery.push({ $match: { sponsorId: qo.sponsorId} });
    lotCountQuery.push({ $group: { _id: "$sponsorId", bCount: { $sum: "$bCount" } , sbCount: { $sum: "$sbCount" }, count: { $sum: 1 } }});

    var result = {};

    User.aggregate(lotCountQuery, function (err, lotCountInfo) {

        if (lotCountInfo) {
            lotCountInfo = lotCountInfo[0];
        }
        //result.lotCountInfo = lotCountInfo
        callback(err, lotCountInfo);
    });
}
exports.getLotCountBySponsor = getLotCountBySponsor;

async function getSponsorDownlineTree(sponsorId, callback) {
    var users = await runSponsorAsyncFunction(sponsorId, [], 0);
    //console.info('users = ', users);
    callback(null, users);
}
exports.getSponsorDownlineTree = getSponsorDownlineTree;

const runSponsorAsyncFunction = async (sponsorId, users, counter) => {
    var query = { _id: true, userName: true, firstName: true, lastName: true, emailAddress: true, phoneNumber: true, referralCode: true, sponsorId: true, position: true, parentId: true, status: true, created: true, updated: true, left: true, right: true, leftMost: true, rightMost: true, active: true, status: true, lots: true, bCount: true, sbCount: true, seqId: true, sponsorName: true, leftCount: true, rightCount: true, puLeftBCount: true, puRightSBCount: true, puLeftSBCount: true, puRightBCount: true, bCount: true, sbCount: true, downlineLots: true  };
    const user = await User.findOne({ _id: id }, query);
    //console.info('user = ', user);
    users.push(user);
    //console.info('counter = ', counter);
    counter++;
    if (user) {
        if (user.left) {
            const left = await runAsyncFunctions(user.left, users, counter);
            //console.log('left = ', left, counter)
        }

        if (user.right) {
            const right = await runAsyncFunctions(user.right, users, counter)
            //console.log('right = ', right, counter);
        }
    }

    //return users;
    if (counter == 1) {
        return users;
    }
}