/**
 * Created by senthil on 09/04/17.
 */

var constants = require('../../src/common/constants')
    , moment = require('moment')
    , child = require("child_process");

var FileUtil = function f(options) {
    var self = this;
};

FileUtil.copySync = function(from, to) {
    from = from.replace(/\//gim,"\\");
    to = to.replace(/\//gim,"\\");
    child.exec("xcopy /y /q \""+from+"\\*\" \""+to+"\\\"");
};

module.exports = FileUtil;