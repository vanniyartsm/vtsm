/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , resEvents = require('../commons/events')
    , Utils = require('../util/util')
    , jwt = require('jsonwebtoken')
    , passport = require('passport')
    , BaseError = require('../commons/BaseError')
    , _ = require('lodash')
    , shortid = require('shortid')
    , faker = require('faker')
    //, axios = require('axios')
    , async = require('async')
    , constants = require('../commons/constants')
    , logger = require('../commons/logger')
    , baseService = require('../commons/base.service')
    , userServiceImpl = require('./impl/user.service.impl');

var User = require('../model/User');

exports.getUsers = function(req, res, next) {
    var token = baseService.getToken(req.headers);
    console.info('token = ', token);
    userServiceImpl.getAllUsers(function(err, users) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        }

        res.status(constants.HTTP_OK).send({
            status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Fetched"),
            data: users});
    })
};

exports.getUserBasicInfo = function(req, res, next) {
    var userName = req.params.userName;
    var token = baseService.getToken(req.headers);
    console.info('token = ', token);
    var user = req.session.user;

    if (user) {
        userServiceImpl.getUserByUserName(userName, function(err, user) {
            if (err) {
                logger.debug(err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 200));
                resEvents.emit('ErrorJsonResponse', req, res, baseError);
            } else {
                var response = {};
                response._id = user._id;
                response.userName = user.userName;
                response.firstName = user.firstName;
                response.lastName = user.lastName;

                res.status(constants.HTTP_OK).send({
                    status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Fetched"),
                    data: response});
            }
        })
    } else {
        var baseError = new BaseError(Utils.buildErrorResponse(constants.HTTP_UNAUTHORIZED, '', constants.HTTP_UNAUTHORIZED, "Unauthorized Access", 403));
                resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }
};

/**
 * Token api.
 *
 * @return {Function}
 * @api public
 */
exports.authToken = function(req, res, next) {
    var userJson = req.body;
    console.info('userJson = ', userJson);
    userServiceImpl.authenticate(userJson, function(err, isMatch, user) {
        console.info('token user = ', user);
        console.info('token user err = ', err);
      if (err) throw err;
  
      if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        // check if password matches
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.sign(user.toJSON(), constants.AUTH_SECRET, {
              expiresIn: 1800 // 1 week
            });
            // return the information including token as JSON
            res.json({success: true, token: token});
          } else {
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      }
    });
};

exports.saveUser = function(req, res, next) {

    // create a new user
    var userJson = req.body;
    console.info('userJson = ', userJson);

    if (_.isEmpty(userJson)) {
        logger.debug(constants.USER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    userServiceImpl.saveMultipleUser([userJson], function (err, result) {
        console.info('saveUser err = ', err);
        if (err) {
            logger.debug(err);
            resEvents.emit('ErrorJsonResponse', req, res, err);
        } else {
            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Saved"),
                data: result.newUser});
        }
    });
};

exports.authenticate = function(req, res, next) {

    // create a user a new user
    var userJson = req.body;

    if (_.isEmpty(userJson)) {
        logger.debug(constants.USER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    userServiceImpl.authenticate(userJson, function(err, isMatch, user) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_PASSWORD_NOT_MATCH, '', constants.USER_PASSWORD_NOT_MATCH_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        }

        if (isMatch) {
            resEvents.emit('JsonResponse', req, res, user);
        } else {
            logger.debug(constants.USER_PASSWORD_NOT_MATCH_MSG);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_PASSWORD_NOT_MATCH, '', constants.USER_PASSWORD_NOT_MATCH_MSG, '', 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        }
    })
};

exports.verifyPassword = function (userJson, callback) {
    userServiceImpl.authenticate(userJson, function (err, isMatch, user) {
        callback(err, isMatch, user);
    });
}

exports.updateUser = function(req, res, next) {
    var id = req.session.user._id;
    req.params.id = id;
    var userJson = req.body;
    userJson.id = id;
    userServiceImpl.updateUser(userJson, function(err, result) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_DUPLICATE, '', constants.USER_DUPLICATE_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            result['message'] ="Successfully Updated"
            resEvents.emit('JsonResponse', req, res, result);
        }
    })
}

exports.updateUserObj = function(user, callback) {
    userServiceImpl.updateUserObj(user, function(err, uUser) {
        callback(err, uUser);
    })
}


exports.updateUserByPassword = function(user, callback) {
    userServiceImpl.updateUserByPassword(user, function(err, uUser) {
        callback(err, uUser);
    })
}

exports.getLotCountBySponsor = function(req, res, next) {
    var sponsorId = req.params.sponsorId;

    userServiceImpl.getLotCountBySponsor({sponsorId : sponsorId}, function(err, result) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.LOTS_VALIDATION, '', constants.LOTS_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            resEvents.emit('JsonResponse', req, res, result);
        }
    })
}

exports.changePassword = function(req, res, next) {
    var id = req.params.id;
    var userJson = req.body;
    userServiceImpl.checkPassword(id, userJson, function(err, isMatch, user) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_DUPLICATE, '', constants.USER_DUPLICATE_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
           if(isMatch) {
               userServiceImpl.updateUserPassword(req, userJson, function(err, result) {
                   if (err) {
                       logger.debug(err);
                       var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_DUPLICATE, '', constants.USER_DUPLICATE_MSG, err.message, 500));
                       resEvents.emit('ErrorJsonResponse', req, res, baseError);
                   } else {
                       result['message'] ="Successfully Updated"
                       resEvents.emit('JsonResponse', req, res, result);
                   }
               })
           } else {
               var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_PASSWORD_NOT_MATCH, '', constants.USER_PASSWORD_NOT_MATCH_MSG, null, 500));
               resEvents.emit('ErrorJsonResponse', req, res, baseError);
           }
        }
    })
}

exports.mailConfig = function(req, res, next) {
    var id = req.session.user._id;
    req.params.id = id;
    var userJson = req.body;
    userServiceImpl.updateUserMailConfig(req, userJson, function(err, result) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FORGOT_PASSWORD_ERR_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            req.session.user = result;
            var respones = {};
            respones['message'] ="Successfully Updated"
            resEvents.emit('JsonResponse', req, res, respones);
        }
    })
}

exports.purchaseUnit = function(req, res, next) {
    var purchaseJson = req.body;
    console.info('purchaseJson = ', purchaseJson);

    if (_.isEmpty(purchaseJson)) {
        logger.debug(constants.USER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.PURCHASE_UNIT_OBJ_EMPTY, '', constants.PURCHASE_UNIT_OBJ_EMPTY_MSG, err.message, 500));
        resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }

    userServiceImpl.purchaseUnit(purchaseJson, function (err, purchaseUnit) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_PURCHASE_UNIT_VALIDATION, '', constants.PURCHASE_UNIT_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Saved"),
                data: purchaseUnit});
        }
    });   
}


exports.getAllUsers = function(callback) {
    userServiceImpl.getAllUsers(function(err, users) {
        if (err) {
            console.info('err = ', err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            callback(baseError, null);
        }

        callback(null, users);
    })
};

exports.getInfoUsers = function(callback) {
    userServiceImpl.getInfoUsers(function(err, users) {
        if (err) {
            console.info('err = ', err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            callback(baseError, null);
        }

        callback(null, users);
    })
};

exports.getManagedUsers = function(callback) {
    userServiceImpl.getManagedUsers(function(err, users) {
        if (err) {
            console.info('err = ', err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            callback(baseError, null);
        }

        callback(null, users);
    })
};


exports.getAllMyDirectUsers = function(sponsorId, callback) {
    userServiceImpl.getAllMyDirectUsers(sponsorId, function(err, users) {
        if (err) {
            console.info('err = ', err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            callback(baseError, null);
        }

        callback(null, users);
    })
};

exports.findAllUsers = function(callback) {
    userServiceImpl.findAllUsers(function(err, users) {
        if (err) {
            console.info('err = ', err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            callback(baseError, null);
        }

        callback(null, users);
    })
};

exports.findAllUsers = function(req, res, next) {
    userServiceImpl.findAllUsers(function(err, users) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_NOT_AVAILABLE, '', constants.USER_NOT_AVAILABLE_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {

                
                var table = [
                {"_id": "Eve",   "parentId": ""},
                {"_id": "Cain",  "parentId": "Eve"},
                {"_id": "Seth",  "parentId": "Eve"},
                {"_id": "Enos",  "parentId": "Seth"},
                {"_id": "Noam",  "parentId": "Seth"},
                {"_id": "Abel",  "parentId": "Eve"},
                {"_id": "Awan",  "parentId": "Eve"},
                {"_id": "Enoch", "parentId": "Awan"},
                {"_id": "Azura", "parentId": "Eve"}
                ];
                
               //console.info('users = ', users);
               console.info('----------------------');
               console.info('users.data = ', users.data);
                // var root = d3.stratify()
                //     .id(function(d) { return d._id; })
                //     .parentId(function(d) { return d.parentId; })
                //     (users);
                // console.info('root = ', root)
                // root.each(function(node) {
                //     console.info('node = ', node.id);
                //     console.info('node children = ', node.children);
                //   });
            resEvents.emit('JsonResponse', req, res, {});
        }
    })
}

exports.getDownlineTree = function(req, res, next) {
    var id = req.params.id;
    userServiceImpl.getDownlineTree(id, function(err, users) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FORGOT_PASSWORD_ERR_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            resEvents.emit('response', req, res, users);
        }
    });
}

exports.getSponsorTree = function(req, res, next) {
    var id = req.params.id;
    userServiceImpl.getSponsorTree(id, function(err, users) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FORGOT_PASSWORD_ERR_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            resEvents.emit('response', req, res, users);
        }
    });
}

exports.getSponsorDownlineTree = function(req, res, next) {
    var sponsorId = req.params.sponsorId;
    userServiceImpl.getSponsorDownlineTree(sponsorId, function(err, users) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FORGOT_PASSWORD_ERR_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            resEvents.emit('response', req, res, users);
        }
    });
}

exports.saveUsers = function (req, res, next) {
    // userServiceImpl.saveUser(function(err, users) {
    //     if (err) {
    //         logger.debug(err);
    //         var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FORGOT_PASSWORD_ERR_MSG, err.message, 500));
    //         resEvents.emit('ErrorJsonResponse', req, res, baseError);
    //     } else {
    //         resEvents.emit('response', req, res, users);
    //     }
    // });
    var totalNumber = req.params.totalNumber;
    // loadTestUsers(totalNumber, function(err, userArray) {

    //     async.each(userArray, function(userJson, eachCallback){
    //         var sponsors = [];
    //         console.info('userJson = ', userJson);
    //         _createUser(userJson, eachCallback);
    //     }, function(err, result) {
    //         //callback(null, testTime, finalQuestions);
    //         //console.info('sponsors = ', sponsors);
    //         console.info('result = ', result);
    //         //var param
    //         //param.result = result;
    //         callback(null, result);
    //     })
    // });

    const waitFor = (ms) => new Promise(r => setTimeout(r, ms))

    loadTestUsers(totalNumber, function(err, userArray) {
        const start = async () => {
            for (let num of userArray) {
            await _createUser(num, function(err, result) {console.info('final result')});
            console.log(num);
            }
            console.log('Done');
        }
        start();
    });
}

function _createUser(userJson, callback) {
    console.info('_createUser');
    // axios.post('http://localhost/rest/api/v1/user', userJson)
    //   .then(function (response) {
    //     console.log('Response = ', response);
    //     callback(response);
    //   })
    //   .catch(function (error) {
    //     console.log('Error = ', error);
    //     callback(error);
    //   });
}

function loadTestUsers(totalNumber, callback) {
    var rootUserReferralCode = "2WEKAVNO";
    var userArray = new Array();
    //var configure = global.config.testData.configure;
    var userReferralCode;
    var counter = 1;
    var position = "L";
    for (var i = 1; i <= totalNumber; i++) {

        if (userReferralCode) {
            rootUserReferralCode = userReferralCode;
        }
        userReferralCode = shortid.generate().toUpperCase();

        if (counter  == 10) {
            position = "L";
        } else {
            if (counter == 5) {
                position = "R";
            }
        }
        //var user = new User({"_id" : mongoose.Types.ObjectId(), userName: 'testuser' + i, password: 'password', firstName : 'Test', lastName : 'User' + i, emailAddress: 'testuser' + i  + '@quberos.com', phoneNo: '2312312335', referralCode : userReferralCode, sponsorId : rootUserReferralCode, position: position, status: constants.USER_REG_STATUS });
        var firstName = faker.name.firstName();
        var userJson = {
            "userName": firstName.toLowerCase() + i,
            "password": "password",
            "firstName" : firstName,
            "lastName" : faker.name.lastName(),
            "emailAddress": faker.internet.email(),
            "phoneNo": faker.phone.phoneNumber(),
            "referralCode": userReferralCode,
            "sponsorId": rootUserReferralCode,
            "position": position,
            "country" : "US"
        }
        console.info('userJson = ', userJson);
        userArray.push(userJson);
        counter++;
    }
    //console.info('saving userArray = ', userArray);
    // userServiceImpl.saveUsers(userArray, function(user) {
    //     console.info('saveUsers = ', user);
    // });
    callback(null, userArray);
}

exports.loadTestUsers = loadTestUsers;

function getSponsorBySponsorId(sponsorId, callback) {
    logger.info('Getting sponsors for admin : ' + sponsorId);

    userServiceImpl.getSponsorBySponsorId(sponsorId, function (err, user) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.SPONSOR_NOT_FOUND, '', constants.SPONSOR_NOT_FOUND_MSG, err.message, 500));
            callback(baseError, user);
        }

        logger.info('Returning sponsor');
        callback(null, user);
    });
};
exports.getSponsorBySponsorId = getSponsorBySponsorId;

function getUserByUserId(userId, callback) {
    logger.info('Getting user for admin : ' + userId);

    userServiceImpl.getUserById(userId, function (err, user) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USERS_NOT_FOUND, '', constants.USERS_NOT_FOUND_MSG, err.message, 500));
            callback(baseError, user);
        }

        logger.info('Returning user');
        callback(null, user);
    });
};
exports.getUserByUserId = getUserByUserId;

function searchUserByQuery(query, callback) {
    logger.info('Getting user for admin : ' + query);

    userServiceImpl.getUserById(query, function (err, user) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.USERS_NOT_FOUND, '', constants.USERS_NOT_FOUND_MSG, err.message, 500));
            callback(baseError, user);
        }

        logger.info('Returning user');
        callback(null, user);
    });
};
exports.getUserByUserId = getUserByUserId;

exports.updateUserProfile = function(userJson, callback) {
    userServiceImpl.updateUser(userJson, function(err, user) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, err.message, 500));
            callback(baseError, user);
        }

        logger.info('Returning user');
        callback(null, user);
    })
}