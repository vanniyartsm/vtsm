var express = require('express')
    , router = express.Router()
    , initFilter = require('../commons/filter');

var userService = require('../service/user.service')

/**
 * Expose all users.
 *
 * @return {Function}
 * @api public
 */
router.get('/', userService.getUsers);

/**
 * Expose all users.
 *
 * @return {Function}
 * @api public
 */
router.get('/:userName', userService.getUserBasicInfo);

/**
 * Creates an user.
 *
 * @return {Function}
 * @api public
 */
router.post('/', userService.saveUser);

/**
 * Auth Token.
 *
 * @return {Function}
 * @api public
 */
router.post('/auth/token', userService.authToken)

/**
 * Authentication for an user.
 *
 * @return {Function}
 * @api public
 */
router.post('/auth', userService.authenticate);

/**
 * Update a user.
 *
 * @return {Function}
 * @api public
 */
router.put('/:id', userService.updateUser);

/**
 * Change password.
 *
 * @return {Function}
 * @api public
 */
router.put('/password/:id', userService.changePassword);

/**
 * Upadte Mail Config.
 *
 * @return {Function}
 * @api public
 */
router.put('/mail/:id', userService.mailConfig);

/**
 * Purchase Unit for an user.
 *
 * @return {Function}
 * @api public
 */
router.post('/purchase', userService.purchaseUnit);

/**
 * Find all users.
 *
 * @return {Function}
 * @api public
 */
router.get('/users', userService.findAllUsers);

/**
 * Creates an user.
 *
 * @return {Function}
 * @api public
 */
router.get('/load/test/users/:totalNumber', userService.saveUsers);

/**
 * Get user downline tree.
 *
 * @return {Function}
 * @api public
 */
router.get('/tree/:id', userService.getDownlineTree);

/**
 * Get user downline tree.
 *
 * @return {Function}
 * @api public
 */
router.get('/direct/tree/:id', userService.getSponsorTree);

module.exports = router;
