/**
 * Created by senthil on 02/27/19.
 */
var events = require('events')
    , logger = require("./logger")
    , constants = require("./constants");

//create an object of EventEmitter class by using above reference
var rem = new events.EventEmitter();

rem.on('JsonResponse', function (req, res, data) {
    res.status(200).send({sucess: true, data: data});
});

rem.on('response', function (req, res, data) {
    res.status(200).send(data);
});

rem.on('ErrorJsonResponse', function (req, res, err) {
    logger.debug('err.errorCode=', err.errorCode + ',err=', err)
    res.status((err.errorCode) ? err.errorCode : 500).send({"status" : err});
});

rem.on('log-event', function(param) {

    //let log = 
    if(param.loglevel == constants.LOG_LEVEL_INFO) {
    } else if(param.loglevel == constants.LOG_LEVEL_DEBUG) {
    } else if(param.loglevel == constants.LOG_LEVEL_ERROR) {
    } else if(param.loglevel == constants.LOG_LEVEL_TRACE) {
    } else if(param.loglevel == constants.LOG_LEVEL_FATAL) {
    } else {
        
    }
})

module.exports = rem;
