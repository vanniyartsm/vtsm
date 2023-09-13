/**
 * Created by senthil on 05/05/17.
 */
'use strict';

var bodybuilder = require('bodybuilder');
var options;

// Constructor builderutil
var jmeterPerfUtil = function f(options) {
    var self = this;
    self.options = options;
};

jmeterPerfUtil.getTestExecutionQuery = function(params) {

    var body = {
        "from": 0,
        "size" : 1000,
        "query":{
            "term" : {"test_execution_id" : params.testExecution._id}
        },
        "aggs" : {
            "average_time" : { "avg" : { "field" : "t" } },
            "min_time" : { "min" : { "field" : "t" } },
            "max_time" : { "max" : { "field" : "t" } },
            "average_response_time" : { "avg" : { "field" : "t" } },
            "max_response_time" : { "max" : { "field" : "ts" } },
            "min_response_time" : { "min" : { "field" : "ts" } },
            "types_count" : { "value_count" : { "field" : "rc" } },
            "total_time_taken" : { "sum" : { "field" : "t" } },
            "total_bytes" : { "sum" : { "field" : "by" } },
            "average_bytes" : { "avg" : { "field" : "by" } },
            "max_latency" : { "max" : { "field" : "lt" } },
            "min_latency" : { "min" : { "field" : "lt" } },
            "load_time_outlier" : {
                "percentiles" : {
                    "field" : "lt"
                }
            },
            "messages" : {
                "filters" : {
                    "filters" : {
                        "success" :   { "match" : { "rc" : 200   }}
                    }
                }
            }
        }
    };

    return {
        index: global.config.elasticSearch.index.perfx360Index,
        body: JSON.stringify(body)
    };
};

module.exports = jmeterPerfUtil;