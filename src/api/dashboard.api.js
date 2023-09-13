var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , logger = require('../commons/logger')
    , baseService = require('../commons/base.service')
    , constants = require('../commons/constants')
    , dashboardService = require('../service/dashboard.service')
    , ledgerService = require('../service/ledger.service')
    , userService = require('../service/user.service');


/**
 * Get Wallet By User.
 *
 * @return {Function}
 * @api public
 */
router.get('/wallet/user/:id', dashboardService.getWalletByUser);

/**
 * Get Lots By User.
 *
 * @return {Function}
 * @api public
 */
router.get('/lots/user/:id', dashboardService.getLotByUser);

/**
 * Get Lots By User.
 *
 * @return {Function}
 * @api public
 */
router.get('/lots/sponsor/:sponsorId', userService.getLotCountBySponsor);

/**
 * Get Downline By User.
 *
 * @return {Function}
 * @api public
 */
router.get('/downline/user/:userId', dashboardService.getDownlineTree);

/**
 * Get Earnings By User.
 *
 * @return {Function}
 * @api public
 */
router.get('/earnings/user/:userId', ledgerService.getEarningsTotalByUser);

module.exports = router;
