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
    , pointsServiceImpl = require('../../service/impl/points.service.impl')
    , ledgerServiceImpl = require('../../service/impl/ledger.service.impl')
    , baseService = require('../../commons/base.service')
    , request = require('request');
const uuidv1 = require('uuid/v1');

router.get('/', function(req, res, next) {
    res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
});

module.exports = router;