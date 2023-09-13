var express = require('express')
    , router = express.Router()
    , resEvents = require('../commons/events')
    , BaseError = require('../commons/BaseError')
    , _ = require('lodash')
    , Utils = require('../util/util')
    , constants = require('../commons/constants')
    , logger = require('../commons/logger')
    , baseService = require('../commons/base.service')
    , pointsService = require('../service/points.service');

/**
 * Initiate points.
 *
 * @return {Function}
 * @api public
 */
router.post('/buy/initiate', pointsService.initiatePoints);

/**
 * Transfer to an user.
 *
 * @return {Function}
 * @api public
 */
router.post('/transfer', pointsService.transfer);


/**
 * Transfer to an user.
 *
 * @return {Function}
 * @api public
 */
router.post('/internal/transfer', pointsService.internalTransfer);

/**
 * Withdraw.
 *
 * @return {Function}
 * @api public
 */
router.post('/withdraw', pointsService.requestWithdraw);


router.get('/buy/units/:userId/:totalNoOfPoints', pointsService.purchaseUnits);

router.post('/buy/request', function(req, res, next) {
    var id = req.body.id;
    console.info('id = ', id);
    pointsService.initiateRequest(id, function(err, blockchainInitiated) {
        console.info('err = ', err);
        if (err) {
            logger.debug(err);
            var baseError = new BaseError(Utils.buildErrorResponse(constants.POINTS_VALIDATION, '', constants.POINTS_VALIDATION_MSG, err.message, 500));
            resEvents.emit('ErrorJsonResponse', req, res, baseError);
        } else {
            res.status(constants.HTTP_OK).send({
                status: baseService.getStatus(req, res, constants.HTTP_OK, "Successfully Requested"),
                data: blockchainInitiated});
        }
    });
});

module.exports = router;
