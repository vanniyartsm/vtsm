/**
 * Created by senthil on 02/27/19.
 */

var Constants = require('./constants')
, passport = require('passport')
, jwt = require('jsonwebtoken')
, _ = require('lodash')
, logger = require('../commons/logger')
, httpContext = require('express-http-context')
, renderConstants = require('./render.constants')
, baseService = require('./base.service')
, uuidv1 = require('uuid/v1');;

require('./passport')(passport);

exports.initValidation = function (req, res, next) {
    //console.info('req.path = ', req.path);
    var token = baseService.getToken(req.headers);
    var user = req.session.user;

    if (req.url == '/v1/user/auth/token' || token || user) {

        if (token) {
            var decoded;
            try {
                var decoded = jwt.verify(token, 'quberosauthsecret',  function(err, decoded) {
                    if (err) {
                        res.status(403).json({success: false, msg: 'Unauthorized.'});
                    } else {
                        next();
                    }
                });
            } catch (e) {
                res.status(403).json({success: false, msg: 'Unauthorized.'});
            }
        } else {
            next();
        }
    } else {
        res.status(403).json({success: false, msg: 'Unauthorized.'});
    }
};

exports.transferValidation = function (req, res, next) {
    next();
};

exports.webValidation = function (req, res, next) {
    //console.info('hash = ', urlObj.hash);
    //if (_.isEmpty(req.session.user)) {
       // res.render(renderConstants.LOGIN_PAGE, { layout: 'home-layout', req: req });
    //}
    //console.info('req url : ', req.url);
    /*var user = req.session.user;

    if( user) {
        logger.info('Web validation enforced : ' + user.userName);
        next();
    } else {
        logger.info('Web validation enforced node user : ' + req.url);
        httpContext.set(constants.REQUESTED_URL, req.url);
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
        next();
    }*/
    next();
};