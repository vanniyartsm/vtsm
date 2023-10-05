/**
 * Created by senthil on 21/04/17.
 */

var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , async = require('async')
    , moment = require('moment')
    , jwt = require('jsonwebtoken')
    , passport = require('passport')
    , logout = require('express-passport-logout')
    , uniqid = require('uniqid')
    , logger = require('../../commons/logger')
    , BaseError = require('../../commons/BaseError')
    , Utils = require('../../util/util')
    , constants = require('../../commons/constants')
    , httpContext = require('express-http-context')
    , renderConstants = require('../../commons/render.constants')
    , userServiceImpl = require('../../service/impl/user.service.impl')
    , dashboardService = require('../../service/dashboard.service')
    , baseService = require('../../commons/base.service');
var fs = require('fs');
var csrf = require('csurf');
const bodyParser = require('body-parser');
var csrfProtect = csrf({ cookie: true })
let parseForm = bodyParser.urlencoded({ extended: false });

require('../../commons/passport')(passport);

//Get Login Page
router.get('/login', csrfProtect, function(req, res, next) {
    res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, csrfToken: req.csrfToken()});
});

//Get Registration Page
router.get('/signup', function(req, res, next) {
    var locals = {
        title: 'Page Title',
        description: 'Page Description',
        header: 'Page Header'
    };
    
    res.render(renderConstants.REGISTER_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req});

});

//Sign Up
router.post('/signup', function(req, res, next) {

    // create a new user
    var memberJson = req.body;

    var transactionPassword = uniqid.time().toLowerCase();
    memberJson.transactionPassword = transactionPassword;

    if (_.isEmpty(memberJson) && _isEmpty(memberJson.emailAddress)) {
        logger.debug(constants.USER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500));
        //resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }
    var memberArray = [memberJson];
    //userServiceImpl.saveUser(memberJson, function (err, user) {
    userServiceImpl.checkMemberByEmailAddress(memberJson.emailAddress, function(err, result) {

        if (!result || (constants.INFO_EMAIL == memberJson.emailAddress)) {
            userServiceImpl.saveMultipleMember(memberArray, function(err, result) {
                var user = result.newUser;
                //req.session.user = user;
                if (err) {
                    logger.debug(err);
                    //var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500, renderConstants.MSG_ERROR));
                    res.render(renderConstants.REGISTER_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: err});
                } else {
                    
                    //baseService.sendRegistrationMailMessage(user, memberJson);
                    var baseMessage = new BaseError(Utils.buildErrorResponseWithType(constants.USER_REGISTERED, '', constants.USER_REGISTERED_MSG, constants.USER_REGISTERED_MSG, 200, constants.ALERT_MESSAGE_SUCCESS));
                    res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: baseMessage});
                    //res.redirect('/web/auth/index');
                }
            });
        } else {
            var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_EMAIL_ALREADY_EXISTS, '', constants.USER_EMAIL_ALREADY_EXISTS_MSG, constants.USER_EMAIL_ALREADY_EXISTS_MSG, 422, constants.ALERT_MESSAGE_DANGER));
            res.render(renderConstants.REGISTER_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: baseError});
        }
    });
});

//Post Register
router.post('/register', function(req, res, next) {

    // create a new user
    var userJson = req.body;

    var transactionPassword = uniqid.time().toLowerCase();
    userJson.transactionPassword = transactionPassword;

    if (_.isEmpty(userJson) && _isEmpty(userJson.userName)) {
        logger.debug(constants.USER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500));
        //resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }
    userJson.userName = userJson.userName.trim();
    var userArray = [userJson];
    //userServiceImpl.saveUser(userJson, function (err, user) {
    userServiceImpl.checkUserByEmailAddress(userJson.emailAddress, function(err, result) {

        if (!result || (constants.INFO_EMAIL == userJson.emailAddress)) {
            userServiceImpl.saveMultipleUser(userArray, function(err, result) {
                var user = result.newUser;
                //req.session.user = user;
                if (err) {
                    logger.debug(err);
                    //var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500, renderConstants.MSG_ERROR));
                    res.render(renderConstants.REGISTER_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: err});
                } else {
                    
                    baseService.sendRegistrationMailMessage(user, userJson);
                    var baseMessage = new BaseError(Utils.buildErrorResponseWithType(constants.USER_REGISTERED, '', constants.USER_REGISTERED_MSG, constants.USER_REGISTERED_MSG, 200, constants.ALERT_MESSAGE_SUCCESS));
                    res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: baseMessage});
                    //res.redirect('/web/auth/index');
                }
            });
        } else {
            var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_EMAIL_ALREADY_EXISTS, '', constants.USER_EMAIL_ALREADY_EXISTS_MSG, constants.USER_EMAIL_ALREADY_EXISTS_MSG, 422, constants.ALERT_MESSAGE_DANGER));
            res.render(renderConstants.REGISTER_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: baseError});
        }
    });
});

router.post('/forgot', function(req, res, next) {
    logger.info('Forgot password submitted');
    var userJson = req.body;
    var password = uniqid.time().toLowerCase();
    var transactionPassword = uniqid.time().toLowerCase();
    userJson.password = password;
    userJson.transactionPassword = transactionPassword;

    if (_.isEmpty(userJson)) {
        logger.debug(constants.USER_OBJ_EMPTY_MSG);
        var baseError = new BaseError(Utils.buildErrorResponse(constants.USER_OBJ_EMPTY, '', constants.USER_OBJ_EMPTY_MSG, err.message, 500));
        res.render(renderConstants.FORGOT_PASSWORD_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: baseError});
        //resEvents.emit('ErrorJsonResponse', req, res, baseError);
    }
    logger.info('Forgot password getting user');
    userServiceImpl.getUserByEmailAddress(userJson.emailAddress, function (err, user) {
        if (err) {
            res.render(renderConstants.FORGOT_PASSWORD_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: err});
        }
        user.password = password;
        user.transactionPassword = transactionPassword;
        logger.info('Forgot password getting user fetched : ' + user.userName);
        userServiceImpl.updateForgotUser(user, function(err, updatedUser) {
            logger.info('Forgot password getting user updated : ' + user.userName);
            if (err) {
                res.render(renderConstants.FORGOT_PASSWORD_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: err});
            } else {
                logger.info('Forgot password mail initiated');
                baseService.sendForgotMailMessage(user, userJson);
                var baseMessage = new BaseError(Utils.buildErrorResponseWithType(constants.USER_FORGOT_PASSWORD, '', constants.USER_FORGOT_PASSWORD_MSG, constants.USER_FORGOT_PASSWORD_MSG, 200, constants.ALERT_MESSAGE_SUCCESS));
                logger.info('Forgot password render back : ' + JSON.stringify(baseMessage));
                res.render(renderConstants.FORGOT_PASSWORD_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: baseMessage});
            }
        });
    });
});

router.get('/forgot', function(req, res, next) {
    res.render(renderConstants.FORGOT_PASSWORD_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req});
});

router.get('/index', function(req, res, next) {
    var user = req.session.user;
    var params = {};
    if (req.query.as != undefined) {
        req.session.loginas = req.query.as;
    }
    if (!_.isEmpty(user)) {
        var token = jwt.sign(user, constants.AUTH_SECRET, {
            expiresIn: 1800 // 1/2 an hour
          });

        dashboardService.getDashboardDetails(user._id, function(err, result) {
            if (err) {
                logger.debug(err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, err.message, 500));
            }
            res.render(renderConstants.HOME_PAGE, {layout: renderConstants.LAYOUT_INNER, user : user, req: req, res: res, moment: moment, token: 'JWT ' + token, result: result, lodash : _});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, params: params, moment: moment, lodash : _ });
    }
});


router.get('/referral/:referralCode', function(req, res, next) {
    var locals = {
        title: 'Page Title',
        description: 'Page Description',
        header: 'Page Header'
    };

    var referralCode = req.params.referralCode;
    userServiceImpl.getSponsor(referralCode, function(err, sponsorUser) {
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.SPONSOR_NOT_FOUND, '', constants.SPONSOR_NOT_FOUND, err.message, 500));
        } else {

            if (sponsorUser) {
                res.render(renderConstants.REGISTER_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req, referralCode : referralCode});
            } else {
                res.render(renderConstants.REGISTER_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, req: req});
            }
        }
    })

});

/**
 * Logout an user.
 *
 * @return {Function}
 * @api public
 */
router.get('/logout', function(req, res, next) {
    //userServiceImpl.authenticate()
    logout();
    var status = {
        code: 200,
        message: 'Successfully logged out'
    }

    req.session.destroy();
    var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.LOGOUT_INFO, '', constants.LOGOUT_INFO_MSG, constants.LOGOUT_INFO_MSG, 500, renderConstants.MSG_INFO));
    res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER, status : status, err : baseError });
});

/**
 * Expose all users.
 *
 * @return {Function}
 * @api public
 */
router.get('/', function(req, res, next) {
    res.render(renderConstants.LOGIN_PAGE, { layout: 'home-layout', req: req });
});

/**
 * Index page.
 *
 * @return {Function}
 * @api public
 */
/*router.get('/index', function(req, res, next) {
    var user = req.session.user;
    var params = {};

    if (!_.isEmpty(user)) {
        projectServiceImpl.getProjects({createdBy : user._id}, function(err, projects) {
            if (err) {
                logger.debug(err);
                //var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, err.message, 500));
            }

            if (req.query.m) {
                params.m = req.query.m;
            }
            res.render('index', {projects: projects, user : user, req: req, moment: moment, err: err});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: 'home-layout', req: req, params: params, moment: moment });
    }
});*/


/**
 * Creates an user.
 *
 * @return {Function}
 * @api public
 */
router.post('/index', function(req, res, next) {

});

/**
 * Authentication for an user.
 *
 * @return {Function}
 * @api public
 */
router.post('/login', parseForm, csrfProtect, function(req, res, next) {
    //userServiceImpl.authenticate()
    var memberJson = req.body;
    var locals = {
        title: 'Page Title',
        description: 'Page Description',
        header: 'Page Header',
        req : req,
        emailAddress: memberJson.emailAddress
    };

    userServiceImpl.authenticateMember(memberJson, function(err, isMatch, member) {
        var params = {};
        if (err) {
            logger.debug(err);
            locals.error = err;
            params.error = err;

            //res.render(renderConstants.LOGIN_PAGE, { layout: 'home-layout', locals: locals });
        }

        if(member) {    
            _verfifyMemberMatching(req, res, member, params, isMatch, err);
        } else {
            var baseError;
            if (member == null) {
                baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_INVALID_CREDENTIALS, '', constants.USER_INVALID_CREDENTIALS_MSG, '', 500, renderConstants.MSG_ERROR));
            } else {
                baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_PASSWORD_NOT_MATCH, '', constants.USER_PASSWORD_NOT_MATCH_MSG, '', 500, renderConstants.MSG_ERROR));
            }
            params.error = baseError;
            res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req, err: baseError, params: params});
        }
    });

});

function _verfifyMemberMatching(req, res, member, params, isMatch, err) {
    if (isMatch) {
        req.session.user = member;
        httpContext.set('user', member);
        var requestedUrl = httpContext.get(constants.REQUESTED_URL);
        console.info('requestedUrl = ', requestedUrl);
        res.redirect('/web/auth/index');
    } else {
        if (err) {
            res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, user: member, params: params});
        } else {
            logger.debug(constants.USER_PASSWORD_NOT_MATCH_MSG);
            var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_PASSWORD_NOT_MATCH, '', constants.USER_PASSWORD_NOT_MATCH_MSG, '', 500, renderConstants.MSG_ERROR));
            params.error = baseError;
            res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, err: baseError, params: params});
        }
    }
}

function _verfifyMatching(req, res, user, params, isMatch, err) {
    if (isMatch) {
        req.session.user = user;
        httpContext.set('user', user);
        var requestedUrl = httpContext.get(constants.REQUESTED_URL);
        console.info('requestedUrl = ', requestedUrl);
        res.redirect('/web/auth/index');
    } else {
        if (err) {
            res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, user: user, params: params});
        } else {
            logger.debug(constants.USER_PASSWORD_NOT_MATCH_MSG);
            var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_PASSWORD_NOT_MATCH, '', constants.USER_PASSWORD_NOT_MATCH_MSG, '', 500, renderConstants.MSG_ERROR));
            params.error = baseError;
            res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, err: baseError, params: params});
        }
    }
}


module.exports = router;