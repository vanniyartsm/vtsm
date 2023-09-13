var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , moment = require('moment')
    , logger = require('../../commons/logger')
    , BaseError = require('../../commons/BaseError')
    , constants = require('../../commons/constants')
    , renderConstants = require('../../commons/render.constants')
    , userService = require('../../service/user.service')
    , pointsService = require('../../service/points.service')
    , payoutService = require('../../service/payout.service')
    , walletService = require('../../service/wallet.service')
    , baseService = require('../../commons/base.service')
    , userService = require('../../service/user.service')
    , accountService = require('../../service/account.service')
    , dashboardService = require('../../service/dashboard.service')
    , generalService = require('../../service/general.service')
    , Utils = require('../..//util/util')
    , moment = require('moment');


router.get('/loginas/:userId', function(req, res, next) {
    logger.info('User from admin');
    var user = req.session.user;
    var userId = req.params.userId;

    if (user && baseService.isAdmin(user)) {
        var loginAsAdmin = false;
        userService.getUserByUserId(userId, function(err, user) {
            var params = {};
            if(user) {    
                _verfifyMatching(req, res, user, params, true, err), loginAsAdmin;
            } else {
                var baseError;
                if (user == null) {
                    baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_INVALID_CREDENTIALS, '', constants.USER_INVALID_CREDENTIALS_MSG, '', 500, renderConstants.MSG_ERROR));
                } else {
                    baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_PASSWORD_NOT_MATCH, '', constants.USER_PASSWORD_NOT_MATCH_MSG, '', 500, renderConstants.MSG_ERROR));
                }
                params.error = baseError;
                res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, err: baseError, params: params});
            }
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/returnback/:userId', function(req, res, next) {
    logger.info('returnback User from admin ', req.session.as);

    if (req.session.loginas != undefined) {
        req.session.loginas = undefined;
        var userId = req.params.userId;
        userService.getUserByUserId(userId, function(err, user) {

            if(err) {
                res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
            }
            if (user && baseService.isAdmin(user)) {
                var loginAsAdmin = true;
                
                    var params = {};
                    if(user) {    
                        _verfifyMatching(req, res, user, params, true, err, loginAsAdmin);
                    } else {
                        var baseError;
                        if (user == null) {
                            baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_INVALID_CREDENTIALS, '', constants.USER_INVALID_CREDENTIALS_MSG, '', 500, renderConstants.MSG_ERROR));
                        } else {
                            baseError = new BaseError(Utils.buildErrorResponseWithType(constants.USER_PASSWORD_NOT_MATCH, '', constants.USER_PASSWORD_NOT_MATCH_MSG, '', 500, renderConstants.MSG_ERROR));
                        }
                        params.error = baseError;
                        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, err: baseError, params: params});
                    }
            } else {
                res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
            }
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});


function _verfifyMatching(req, res, user, params, isMatch, err, loginAsAdmin) {
    console.info('isMatch : ', isMatch);
    console.info('loginAsAdmin : ', loginAsAdmin);
    if (isMatch) {
        req.session.user = user;
        if (loginAsAdmin) {
            res.redirect('/web/admin/users');
        } else {
            console.info('Redirecting');
            res.redirect('/web/auth/index?as=admn');
        }
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

router.get('/users', function(req, res, next) {
    logger.info('Requesting users from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        userService.getManagedUsers(function(err, users) {
            logger.info('Responding with users for admin');
            res.render(renderConstants.ADMIN_USERS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, users : users, err: err, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/infousers', function(req, res, next) {
    logger.info('Requesting infousers from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        userService.getInfoUsers(function(err, users) {
            logger.info('Responding with users for admin');
            res.render(renderConstants.ADMIN_INFO_USERS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, users : users, err: err, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});


router.get('/accounts', function(req, res, next) {
    logger.info('Requesting accounts from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        accountService.getAllAccounts(function (err, accounts) {
            logger.info('Responding with accounts for admin');
            res.render(renderConstants.ADMIN_ACCOUNTS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, accounts : accounts, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/btc/initiated', function(req, res, next) {
    logger.info('Requesting bitcoin initiated from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        logger.info('Get all pending blockchain initiated');
        pointsService.getAllRequestedBlockchainInitiated(function(err, btcRequested) {
            pointsService.getAllPendingBlockchainInitiated(function(err, btcPending) {
                console.info('btcRequested = ', btcRequested);
                console.info('ebtcPendingrr = ', btcPending);
                logger.info('Responding with blockchainInitiatedList for admin');
                res.render(renderConstants.ADMIN_BTC_INITIATED_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, btcRequested : btcRequested, btcPending: btcPending, err: err, moment : moment});
            });
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/support/tickets', function(req, res, next) {
    logger.info('Requesting support tickets from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        generalService.getAllOpenSupports(function(err, supports) {
            generalService.getAllRespondedAndClosedSupports(function(err, closedSupports) {
                logger.info('Get all closed supports for admin');
                res.render(renderConstants.ADMIN_SUPPORT_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, err: err, supports: supports, closedSupports: closedSupports, moment : moment});
            });
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/withdraw/requests', function(req, res, next) {
    logger.info('Requesting withdraws from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        walletService.getAllWithdrawRequests(function(err, withdrawRequests) {
            logger.info('Responding with withdraw for admin');
            res.render(renderConstants.ADMIN_WITHDRAW_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, withdrawRequests: withdrawRequests, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/withdraw/requests/history', function(req, res, next) {
    logger.info('get all other than requested withdraws from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        walletService.getAllWithdrawsOtherthanRequests(function(err, withdraws) {
            logger.info('get all other than requested withdraw for admin');
            res.render(renderConstants.ADMIN_WITHDRAW_HISTORY_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, withdraws: withdraws, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/withdraw/approval/:withdrawId', function(req, res, next) {
    logger.info('Get withdraw approval from admin');
    var user = req.session.user;
    var withdrawId = req.params.withdrawId;

    if (user && baseService.isAdmin(user)) {
        walletService.getWithdrawById(withdrawId, function(err, withdraw) {
            logger.info('Responding with withdraw approval for admin');
            res.render(renderConstants.ADMIN_WITHDRAW_APPROVAL_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, withdraw: withdraw, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.post('/withdraw/approval', function(req, res, next) {
    logger.info('Get withdraw approval from admin');
    var user = req.session.user;
    var withdrawReq = req.body;

    logger.info("withdrawReq = " + JSON.stringify(withdrawReq));
    if (user && baseService.isAdmin(user)) {
        logger.info('calling initiate');
        walletService.initiateWithrawApprovalProcess(withdrawReq, function(err, withdraw) {
            logger.info('Responding with withdraw approval for admin');
            res.render(renderConstants.ADMIN_WITHDRAW_APPROVAL_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, withdraw: withdraw, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/deposit/approval/:depositReqId', function(req, res, next) {
    logger.info('Get Deposit Request approval from admin');
    var user = req.session.user;
    var depositReqId = req.params.depositReqId;

    if (user && baseService.isAdmin(user)) {
        walletService.getDepositRequestById(depositReqId, function(err, blockchainInitiate) {
            logger.info('Responding with deposit approval for admin ' + JSON.stringify(blockchainInitiate));
            res.render(renderConstants.ADMIN_DEPOSIT_APPROVAL_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, blockchainInitiate: blockchainInitiate, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.post('/deposit/approval', function(req, res, next) {
    logger.info('Get deposit approval from admin');
    var user = req.session.user;
    var depositReq = req.body;

    logger.info("depositReq = " + JSON.stringify(depositReq));
    if (user && baseService.isAdmin(user)) {
        logger.info('calling initiate');
        walletService.initiateDepositApprovalProcess(depositReq, function(err, blockchainInitiate) {
            logger.info('Responding with deposit approval for admin ' + JSON.stringify(blockchainInitiate));
            res.render(renderConstants.ADMIN_DEPOSIT_APPROVAL_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, blockchainInitiate: blockchainInitiate, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});


router.get('/withdraw/history', function(req, res, next) {
    logger.info('Get withdraw history from admin');
    var user = req.session.user;
    var withdrawId = req.params.withdrawId;

    if (user && baseService.isAdmin(user)) {
        walletService.getAllWithdrawHistory(function(err, withdraws) {
            logger.info('Responding with withdraw history for admin');
            res.render(renderConstants.ADMIN_WITHDRAW_HISTORY_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, withdraws: withdraws, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/account/details', function(req, res, next) {
    logger.info('Requesting Accounts from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        //pointsService.getAllPendingBlockchainInitiated(function(err, blockchainInitiatedList) {
            logger.info('Responding with accounts for admin');
            res.render(renderConstants.ADMIN_ACCOUNTS_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, err: err, moment : moment});
        //});
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});


router.get('/sponsor/:sponsorId/:userName', function(req, res, next) {
    var user = req.session.user;
    var sponsorId = req.params.sponsorId;
    var userName = req.params.userName;
    logger.info('Requesting sponsor with sponsorId : ' + sponsorId);

    if (user && baseService.isAdmin(user)) {
        userService.getSponsorBySponsorId(sponsorId, function(err, sponsorUser) {
            logger.info('Rendering Sponsor information');
            res.render(renderConstants.SPONSOR_USER_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, sponsorUser : sponsorUser, userName: userName, err: err, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }

});

router.get('/user/info/:userId', function(req, res, next) {
    var user = req.session.user;
    var userId = req.params.userId;
    logger.info('Requesting user info with userId : ' + userId);

    if (user && baseService.isAdmin(user)) {
        userService.getUserByUserId(userId, function(err, currentUser) {
            dashboardService.getDashboardDetails(userId, function(err, result) {
                if (err) {
                    logger.debug(err);
                    var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, err.message, 500));
                }
                logger.info('responding to home page');
                res.render(renderConstants.HOME_PAGE, {layout: renderConstants.LAYOUT_ONLY_BODY, user : currentUser, req: req, res: res, moment: moment, result: result, lodash : _});
            });
        });
    } else {
        //res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
        res.redirect('/web/auth/index');
    }

});

router.get('/profile/info/:userId', function(req, res, next) {
    var user = req.session.user;
    var userId = req.params.userId;
    logger.info('Requesting user info with userId : ' + userId);

    if (user && baseService.isAdmin(user)) {
        userService.getUserByUserId(userId, function(err, user) {
            if (err) {
                logger.debug(err);
                var baseError = new BaseError(Utils.buildErrorResponse(constants.FATAL_ERROR, '', constants.FATAL_ERROR_MSG, err.message, 500));
            }
            logger.info('responding to profile info');
            res.render(renderConstants.ADMIN_PROFILE_UPDATE_PAGE, {layout: renderConstants.LAYOUT_ONLY_BODY, req: req, res: res, moment: moment, user: user, lodash : _});
        });
    } else {
        //res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
        res.redirect('/web/auth/index');
    }

});

router.post('/profile/update', function(req, res, next) {
    var user = req.session.user;
    var userJson = req.body;
    userJson.id = userJson.userId;
    console.info('userJson update = ', userJson);
    if (user && baseService.isAdmin(user)) {
        userService.getUserByUserId(userJson.userId, function(err, profileUser) {
            userService.updateUserProfile(userJson, function(err, cUser) {
                profileUser.firstName = userJson.firstName;
                profileUser.lastName = userJson.lastName;
                profileUser.emailAddress = userJson.emailAddress;
                profileUser.phoneNo = userJson.phoneNo;
                var baseError = new BaseError(Utils.buildErrorResponseWithType(constants.PROFILE_UPDATE_INFO, '', constants.PROFILE_UPDATE_INFO_MSG, constants.PROFILE_UPDATE_INFO_MSG, 500, renderConstants.MSG_INFO));
                res.render(renderConstants.PROFILE_UPDATE_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, user : profileUser, moment : moment, err : baseError});
            });
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req : req});
    }
});


// Cutoff View

router.get('/payouts/binary/cutoffs', function(req, res, next) {
    logger.info('Get Binary payout cutoffs from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        payoutService.getAllBinaryCutoffs(function(err, binaryCutoffs) {
            logger.info('Responding with all binary cutoffs for admin');
            res.render(renderConstants.ADMIN_BINARY_CUTOFF_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, binaryCutoffs: binaryCutoffs, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/payouts/trading/cutoffs', function(req, res, next) {
    logger.info('Get Trading payout cutoffs from admin');
    var user = req.session.user;

    if (user && baseService.isAdmin(user)) {
        payoutService.getAllBinaryCutoffs(function(err, tradingCutoffs) {
            logger.info('Responding with all trading cutoffs for admin');
            res.render(renderConstants.ADMIN_TRADING_CUTOFF_PAGE, { layout: renderConstants.LAYOUT_INNER, req: req, tradingCutoffs: tradingCutoffs, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

router.get('/payouts/cutoff/:userId', function(req, res, next) {
    logger.info('Get payouts cutoffId from admin');
    var user = req.session.user;
    var cutoffId = req.params.cutoffId;
    logger.info('userId : ', req.params.userId);
    logger.info('cutoffId : ', cutoffId);

    if (user && baseService.isAdmin(user)) {
        payoutService.getPayoutByCutoffId(cutoffId, function(err, payouts) {
            logger.info('cutoffId payouts : ', JSON.stringify(payouts));
            logger.info('Responding with all payouts by cutoffId for admin');
            res.render(renderConstants.ADMIN_PAYOUT_PAGE, { layout: renderConstants.LAYOUT_ONLY_BODY, req: req, payouts: payouts, moment : moment});
        });
    } else {
        res.render(renderConstants.LOGIN_PAGE, {layout: renderConstants.LAYOUT_NO_HEADER, req: req});
    }
});

module.exports = router;