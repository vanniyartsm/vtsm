/**
 * Created by senthil on 08/04/17.
 */

'use strict';

var bodybuilder = require('bodybuilder');
var options;

// Constructor builderutil
var esDbUtil = function f(options) {
    var self = this;
    self.options = options;
};

esDbUtil.constructDbIndex = function(req, indexName) {
    var dbIndex = { index: indexName };
    return dbIndex;
};


builderutil.buildTestMappings = function(req) {
    var body = {
        properties: {
            project_id: { type: "string"},
            component_id: { type: "string" },
            project_name: { type: "string" },
            enviromnent: { type: "string" },
            test_id: { type: "string" },
            test_type: { type: "string" },
            execution_time : {type: "date", "format": "yyyyMMdd'T'HHmmssZ"},
            version : { type: "float" },
            group: { type: "string" },
            ts : {"type":   "date", "format": "epoch_millis"},
            dt: { type: "string" },
            tn: { type: "string" },
            lb: { type: "string" },
            t: { type: "long" },
            rm: { type: "string" },
            rc: { type: "long" },
            s: { type: "boolean"},
            property : {
                "type" : "object",
                "properties" : {
                    "xs" : {"type" : "string", "index" : "not_analyzed"},
                    "name" : {"type" : "string", "index" : "not_analyzed"}
                }
            },
            assertion_result : {
                "type" : "object",
                "properties" : {
                    "fm" : {"type" : "string", "index" : "not_analyzed"},
                    "error" : {"type" : "boolean", "index" : "not_analyzed"},
                    "failure" : {"type" : "boolean", "index" : "not_analyzed"}
                }
            },
            by: {type : "long"},
            status: { type: "boolean", "index" : "not_analyzed" }
        }
    };

    return {
        index: global.config.elasticSearch.indexDefaultName,
        type: global.config.elasticSearch.defaultTypeName,
        body: JSON.stringify(body)
    };
};

module.exports = builderutil;