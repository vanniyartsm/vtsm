    var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , logout = require('express-passport-logout')
    , logger = require('../../commons/logger')
    , BaseError = require('../../commons/BaseError')
    , Utils = require('../..//util/util')
    , constants = require('../../commons/constants')
    , renderConstants = require('../../commons/render.constants')
    , resEvents = require('../../commons/events')
    , userService = require('../../service/user.service')
    , userServiceImpl = require('../../service/impl/user.service.impl')
    , pointsService = require('../../service/points.service')
    , pointsServiceImpl = require('../../service/impl/points.service.impl')
    , ledgerServiceImpl = require('../../service/impl/ledger.service.impl')
    , baseService = require('../../commons/base.service')
    , request = require('request')
    , moment = require('moment');
const uuidv1 = require('uuid/v1');

router.get('/tree', function(req, res, next) {
    var user = req.session.user;
    if(user) {
        res.render(renderConstants.DOWNLINE_TREE_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, moment: moment});
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/direct/tree', function(req, res, next) {
    var user = req.session.user;
    if(user) {
        res.render(renderConstants.DOWNLINE_DIRECT_TREE_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, moment: moment});
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/directs', function(req, res, next) {
    var user = req.session.user;
    if(user) {
        userService.getAllMyDirectUsers(user.referralCode, function (err, directs){
            res.render(renderConstants.DOWNLINE_DIRECTS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, directs: directs, moment: moment});
        })
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

router.get('/transfer/points', function(req, res, next) {
    var locals = {
        title: 'Page Title',
        description: 'Page Description',
        header: 'Page Header'
    };

    var user = req.session.user;
    if (user) {
        pointsServiceImpl.getBalance({userId: user._id, walletId: constants.WT_TRADE_WALLET_ID}, (err, balance) => {
            pointsService.getTransferPointsByUserId(user._id, function (err, result) {
                res.render(renderConstants.TRANSFER_UNITS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user: user, balance: balance, moment: moment, result : result});
            })
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, { layout: renderConstants.LAYOUT_NO_HEADER});
    }
});

module.exports = router;