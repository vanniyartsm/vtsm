var express = require('express')
    , router = express.Router()
    , _ = require('lodash')
    , logger = require('../../commons/logger')
    , renderConstants = require('../../commons/render.constants');

router.get('/crypto-trading', function(req, res, next) {
    logger.info('Crypto Trading Page view');
    res.render(renderConstants.WEB_SITE_CRYPTO_TRADING_PAGE, {layout: renderConstants.LAYOUT, req: req});
});

router.get('/about-us', function(req, res, next) {
    logger.info('About Us Page view');
    res.render(renderConstants.WEB_SITE_ABOUT_US_PAGE, {layout: renderConstants.LAYOUT, req: req});
});

router.get('/quberos-token', function(req, res, next) {
    logger.info('Quberos Token Page view');
    res.render(renderConstants.WEB_SITE_QUBEROS_TOKEN_PAGE, {layout: renderConstants.LAYOUT, req: req});
});

router.get('/business-opp', function(req, res, next) {
    logger.info('Business Opportunity Page view');
    res.render(renderConstants.WEB_SITE_BUSINESS_OPP_PAGE, {layout: renderConstants.LAYOUT, req: req});
});

module.exports = router;