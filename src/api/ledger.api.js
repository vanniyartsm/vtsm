var express = require('express')
    , router = express.Router();

var ledgerService = require('../service/ledger.service')

/**
 * Creates an user.
 *
 * @return {Function}
 * @api public
 */
router.post('/', ledgerService.saveLedger);

module.exports = router;
