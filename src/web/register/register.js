var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , logout = require('express-passport-logout')
    , logger = require('../../commons/logger')
    , BaseError = require('../../commons/BaseError')
    , Utils = require('../..//util/util')
    , constants = require('../../commons/constants')
    , renderConstants = require('../../commons/render.constants')
    , userServiceImpl = require('../../service/impl/user.service.impl')
    , baseService = require('../../commons/base.service');

router.get('/register', function(req, res, next) {
    res.render(renderConstants.REGISTER_PAGE, { layout: 'no-header-layout', req: req, subscriptions: '' });
});

router.get('/login', function(req, res, next) {
    res.render(renderConstants.LOGIN_PAGE, { layout: 'no-header-layout', req: req, subscriptions: '' });
});

router.post('/login', function(req, res, next) {
    res.render(renderConstants.LOGIN_PAGE, { layout: 'no-header-layout', req: req, subscriptions: '' });
});
module.exports = router;