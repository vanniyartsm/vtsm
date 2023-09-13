var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , logger = require('../../commons/logger')
    , BaseError = require('../../commons/BaseError')
    , constants = require('../../commons/constants')
    , renderConstants = require('../../commons/render.constants')
    , userServiceImpl = require('../../service/impl/user.service.impl')
    , userService = require('../../service/user.service')
    , baseService = require('../../commons/base.service')
    , Utils = require('../..//util/util')
    , moment = require('moment');

router.get('/index', function(req, res, next) {
    var user = req.session.user;

    if (user) {
        userServiceImpl.getUserById(user._id, function(err, cUser) {
            console.info('user ',  cUser);
            res.render(renderConstants.PROFILE_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user : cUser, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req : req});
    }
});


router.get('/password', function(req, res, next) {
    var user = req.session.user;

    if (user) {
        //userServiceImpl.getUserById(user._id, function(err, cUser) {
            console.info('user ',  user);
            res.render(renderConstants.PROFILE_PASSWORD_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user : user, moment : moment});
        //});
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req : req});
    }
});

router.post('/password', function(req, res, next) {
    var user = req.session.user;
    logger.info('req.body = ', JSON.stringify(req.body));
    var userJson = req.body;
    logger.info('userJson.password = ', userJson.password);
    logger.info('userJson.confirmPassword = ', userJson.confirmPassword);

    logger.info('userJson = ', userJson);

    /*
    if (user) {
        userJson.userName = user.userName;
        if (userJson.password == userJson.confirmPassword) {
            userService.verifyPassword(userJson, function(err, isMatch, vUser) {
                console.info('vUser ',  vUser);
                logger.info('isMatch = ', isMatch);

                if (!isMatch) {
                    var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_OLD_PASSWORD_NOT_MATCH, '', constants.USER_OLD_PASSWORD_NOT_MATCH_MSG, constants.USER_OLD_PASSWORD_NOT_MATCH_MSG, 500, constants.ALERT_MESSAGE_DANGER));
                    response.err = baseError;
                    res.render(renderConstants.PROFILE_PASSWORD_PAGE, response);
                } else {
                    user.password = userJson.password;
                    userService.updateUserbyUser(user, function(err, updatedUser) {

                        res.render(renderConstants.PROFILE_PASSWORD_PAGE, response);
                    })
                }
            });
        } else {
            var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_OLD_NEW_PASSWORD_NOT_MATCH, '', constants.USER_OLD_NEW_PASSWORD_NOT_MATCH_MSG, constants.USER_OLD_NEW_PASSWORD_NOT_MATCH_MSG, 500, constants.ALERT_MESSAGE_DANGER));
            response.err = baseError;
        }
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req : req});
    }*/

    res.render(renderConstants.PROFILE_PASSWORD_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user : user, moment : moment});
});

router.get('/update/index', function(req, res, next) {
    var user = req.session.user;

    if (user) {
        userServiceImpl.getUserById(user._id, function(err, cUser) {
            res.render(renderConstants.PROFILE_UPDATE_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user : cUser, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req : req});
    }
});

router.post('/update', function(req, res, next) {
    var user = req.session.user;
    var userJson = req.body;
    console.info('userJson update = ', userJson);
    if (user) {
        userJson.id = user._id;
        userServiceImpl.updateUser(userJson, function(err, cUser) {
            user.firstName = userJson.firstName;
            user.lastName = userJson.lastName;
            user.emailAddress = userJson.emailAddress;
            user.phoneNo = userJson.phoneNo;
            var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.PROFILE_UPDATE_INFO, '', constants.PROFILE_UPDATE_INFO_MSG, constants.PROFILE_UPDATE_INFO_MSG, 500, renderConstants.MSG_INFO));
            res.render(renderConstants.PROFILE_UPDATE_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user : user, moment : moment, err : baseError});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req : req});
    }
});

router.post('/password/update', function(req, res, next) {
    var user = req.session.user;
    var userJson = req.body;
    var responseObj = { layout: renderConstants.LAYOUT_INNER, req: req, user : user, moment : moment};
    if (user) {
        userJson.userName = user.userName;
        userJson.password = userJson.oldPassword;

        if (userJson.newPassword == userJson.confirmPassword) {
            userService.verifyPassword(userJson, function(err, isMatch, vUser) {

                if (!isMatch) {
                    var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_OLD_PASSWORD_NOT_MATCH, '', constants.USER_OLD_PASSWORD_NOT_MATCH_MSG, constants.USER_OLD_PASSWORD_NOT_MATCH_MSG, 500, constants.ALERT_MESSAGE_DANGER));
                    responseObj.err = baseError;
                    res.render(renderConstants.PROFILE_PASSWORD_PAGE, responseObj);
                } else {
                    vUser.password = userJson.newPassword;
                    userService.updateUserObj(vUser, function(err, updatedUser) {
                        var message = new BaseError(Utils.buildErrorResponseWithType(constants.USER_PASSWORD_UPDATED, '', constants.USER_PASSWORD_UPDATED_MSG, constants.USER_PASSWORD_UPDATED_MSG, 200, constants.ALERT_MESSAGE_SUCCESS));
                        responseObj.err = message;
                        res.render(renderConstants.PROFILE_PASSWORD_PAGE, responseObj);
                    })
                }
            });
        } else {
            var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_OLD_NEW_PASSWORD_NOT_MATCH, '', constants.USER_OLD_NEW_PASSWORD_NOT_MATCH_MSG, constants.USER_OLD_NEW_PASSWORD_NOT_MATCH_MSG, 500, constants.ALERT_MESSAGE_DANGER));
            responseObj.err = baseError;
            res.render(renderConstants.PROFILE_PASSWORD_PAGE, responseObj);
        }
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req : req});
    }
});

module.exports = router;