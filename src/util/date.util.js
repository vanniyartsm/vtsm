/**
 * Created by senthil on 09/04/17.
 */

var constants = require('../../src/common/constants')
    , moment = require('moment');

var DateUtil = function f(options) {
    var self = this;
};

DateUtil.getCurrentDate = function() {
    //var now = moment()
    //var formatted = now.format(constants.GLOBAL_DATE_FORMAT)
    //console.log('formatted = ', formatted);

    return new Date();
};

module.exports = DateUtil;