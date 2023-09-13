/**
 * Created by senthil on 05/05/17.
 */
'use strict';

var bodybuilder = require('bodybuilder');
var esCommons = require('../../search/commons/es.constants');
var logger = require('../commons/logger');
var _ = require('lodash')
var options;

// Constructor artilleryBuilderUtil
var artilleryBuilderUtil = function f(options) {
    var self = this;
    self.options = options;
};

/*
 * Construct Summary Query using builder util
 */
artilleryBuilderUtil.getTestExecutionSummaryQuery = function(params) {
    var body = bodybuilder()
        .size(esCommons.SEARCH_DEFAULT_SIZE)
        .query('match', 'testExecutionId', params.testExecutionId)
        .build();

    logger.debug(body);

    return {
        index: global.config.elasticSearch.index.perfx360Index,
        type: esCommons.INDEX_TYPE_AY_SUMMARY,
        body: JSON.stringify(body)
    };
};

artilleryBuilderUtil.getA11yTestExecutionSummaryQuery = function(params) {

    var range = {};
    if(params.updated) {
        range.gt = params.updated;
        range.time_zone = '+05:30'
    }

    var body = bodybuilder()
        .size(esCommons.SEARCH_MAX_SIZE)
        .sort('updated')
        .query('match', 'testExecutionId', params.testExecutionId)
        .query('range', 'updated', range)
        .aggregation('sum', 'stats.result.warning')
        .aggregation('sum', 'stats.result.notice')
        .aggregation('sum', 'stats.result.error')
        .aggregation('sum', 'stats.total')
        .aggregation('sum', 'stats.totalLevelResults.A')
        .aggregation('sum', 'stats.totalLevelResults.AA')
        .aggregation('sum', 'stats.totalLevelResults.AAA')
        .aggregation('sum', 'stats.principleResult.Understandable')
        .aggregation('sum', 'stats.principleResult.Robust')
        .aggregation('sum', 'stats.principleResult.Perceivable')
        .aggregation('sum', 'stats.principleResult.Operable')
        .aggregation('sum', 'stats.techniqueResult.Common Failures')
        .aggregation('sum', 'stats.techniqueResult.LayoutTable')
        .aggregation('sum', 'stats.techniqueResult.General')
        .aggregation('sum', 'stats.techniqueResult.HTML')
        ;

    if(params.urlId) {
        body.query('match', 'stats.urlId', params.urlId)
    }


    if(params.status) {
        body.query('match', 'stats.status', 'COMPLETED')
    }

    logger.debug(body);

    return {
        index: global.config.elasticSearch.index.accessibilityIndex,
        type: esCommons.INDEX_TYPE_A11Y_SUMMARY,
        body: JSON.stringify(body.build())
    };
};


artilleryBuilderUtil.getA11yTestExecutionQuery = function(params) {

    var body = bodybuilder()
        .size(esCommons.SEARCH_MAX_SIZE)
        .sort('updated')
        .query('match', 'testExecutionId', params.testExecutionId)
        .query('match', 'urlId', params.urlId);
    if(params.te) {
        body.query('match', 'techniqueName', params.te);
    }

    if(params.type) {
        body.query('match', 'type', params.type);
    }

    if(params.principle) {
        body.query('match', 'principle', params.principle);
    }
    logger.debug(body);

    return {
        index: global.config.elasticSearch.index.accessibilityIndex,
        type: esCommons.INDEX_TYPE_A11Y,
        body: JSON.stringify(body.build())
    };
};

/*
 * Construct Result Query using builder util
 */
artilleryBuilderUtil.getTestExecutionQuery = function(params) {
    var range = {};
    var sizeCount = esCommons.SCROLL_SIZE;
    var filterData = {};
    if(params.updated) {
        range.gt = params.updated;
        range.time_zone = '+05:30'
    }

    if(params.size != undefined) {
        sizeCount = params.size;
    }

    if(params.excludeOptions != undefined) {
        filterData.exclude = [ "latencies", "customStats", "latencyStats" ]
    } else {
        filterData.include = ["*"]
    }

    var body = bodybuilder()
        .size(sizeCount)
        .sort('updated')
        .rawOption('_source', filterData)
        .query('match', 'testExecutionId', params.testExecutionId)
        .query('range', 'updated', range)
        .aggregation('sum', 'completedRequests')
        .aggregation('sum', 'completedScenarios')
        .aggregation('sum', 'generatedScenarios')
        .aggregation('max', 'maxLatency')
        .aggregation('min', 'minLatency')
        .aggregation('sum', 'codes.200')
        .aggregation('sum', 'codes.301')
        .aggregation('sum', 'codes.302')
        .aggregation('avg', 'averageLatency')
        .aggregation('sum', 'totalLatencies')
        .build();

    logger.debug(body);
    return {
        index: global.config.elasticSearch.index.perfx360Index,
        type: esCommons.INDEX_TYPE_AY,
        scroll: "1m",
        body: JSON.stringify(body)
    };
};



/*
 * Construct Result Query using builder util
 */
artilleryBuilderUtil.getTestExecutionSearchQuery = function(params) {
    var range = {};
    var body = bodybuilder()
        .size(esCommons.SCROLL_SIZE)
        .rawOption('_source', ['totalLatencies'])
        .sort('updated', {'order': 'desc'})
        .query('match', 'testExecutionId', params.testExecutionId)
        .aggregation('sum', 'completedRequests')
        .aggregation('sum', 'completedScenarios')
        .aggregation('sum', 'generatedScenarios')
        .aggregation('max', 'maxLatency')
        .aggregation('min', 'minLatency')
        .aggregation('sum', 'codes.200')
        .aggregation('avg', 'averageLatency')
        .aggregation('sum', 'totalLatencies')
        .build();

    logger.debug(body);

    return {
        index: global.config.elasticSearch.index.perfx360Index,
        scroll: esCommons.SCROLL_SEARCH_SECONDS,
        type: esCommons.INDEX_TYPE_AY,
        body: JSON.stringify(body)
    };
};

artilleryBuilderUtil.getTestResultQuery = function(params) {
    var range = {};
    var sizeCount = esCommons.SEARCH_MAX_LARGE_SIZE;
    var filterData = {};
    var order = 'desc';
    var orderField = 'maxLatency';
    if(params.order != undefined) {
        order = params.order
    }

    if(params.orderField != undefined) {
        orderField = params.orderField
    }

    if(params.size != undefined) {
        sizeCount = params.size;
    }

    if(params.excludeOptions != undefined) {
        filterData.exclude = [ "customStats", "latencyStats" ]
    } else {
        filterData.include = ["*"]
    }

    var body = bodybuilder()
        .size(sizeCount)
        .sort(orderField, order)
        .rawOption('_source', filterData)
        .query('match', 'testExecutionId', params.testExecutionId)
        .aggregation('sum', 'completedRequests')
        .aggregation('sum', 'completedScenarios')
        .aggregation('sum', 'generatedScenarios')
        .aggregation('max', 'maxLatency')
        .aggregation('min', 'minLatency')
        .aggregation('sum', 'codes.200')
        .aggregation('sum', 'codes.301')
        .aggregation('sum', 'codes.302')
        .aggregation('avg', 'averageLatency')
        .aggregation('sum', 'totalLatencies').build();
    logger.debug(body);
    return {
        index: global.config.elasticSearch.index.perfx360Index,
        type: esCommons.INDEX_TYPE_AY,
        body: JSON.stringify(body)
    };
};


artilleryBuilderUtil.getTestResultQueryByDate = function(params) {
    var range = {};
    var sizeCount = esCommons.SEARCH_MAX_LARGE_SIZE;

    var body = bodybuilder()
        .size(sizeCount)
        .query('match', 'testExecutionId', params.testExecutionId)
        .query('match', 'updatedMillis', params.updatedMillis)
        .aggregation('sum', 'completedRequests')
        .aggregation('sum', 'completedScenarios')
        .aggregation('sum', 'generatedScenarios')
        .aggregation('max', 'maxLatency')
        .aggregation('min', 'minLatency')
        .aggregation('sum', 'codes.200')
        .aggregation('sum', 'codes.301')
        .aggregation('sum', 'codes.302')
        .aggregation('avg', 'averageLatency')
        .aggregation('sum', 'totalLatencies').build();
    logger.debug(body);
    return {
        index: global.config.elasticSearch.index.perfx360Index,
        type: esCommons.INDEX_TYPE_AY,
        body: JSON.stringify(body)
    };
};

/*
 * Construct Scroll Query using builder util
 */
artilleryBuilderUtil.getTestExecutionScrollQuery = function(params) {
    var scrollParam = {
        scrollId: params.scrollId,
        scroll: esCommons.SCROLL_SEARCH_SECONDS
    };

    return scrollParam;
};

artilleryBuilderUtil.getTestResByUrl = function(params) {
    var urlParams = [];
    if(params.summary) {
        if(!_.isEmpty(params.summary.urlArray)) {
            _.forEach(params.summary.urlArray, function (val) {
                urlParams.push({"index": [  global.config.elasticSearch.index.perfx360Index ], "ignore_unavailable": true },
                    {"size": 10000, "aggs": {"nestedDocs": {"nested": {"path": "latencyStats"}, "aggs": {"latencyDetails": {"filter": {"term": {"latencyStats.headers.perfx-req-urlid": val.headers['perfx-req-urlid']} }, "aggs": {"latencyStats": {"stats": {"field": "latencyStats.latencyVal.latency"} } } } } } }, "query": {"bool": {"must": [{"match": {"testExecutionId": params.testExecutionId} }, {"nested": {"path": "latencyStats", "query": {"bool": {"must": [{"match": {"latencyStats.headers.perfx-req-urlid" :  val.headers['perfx-req-urlid'] } } ] } } } }], "must_not": [] } }, "_source": {"includes": ["latencyStats.*"] }, "version": true })
            })
        }
    }

    return urlParams;
};

artilleryBuilderUtil.getTestResByUrlId = function(params) {
    var urlParams = [];
    if(params.urlId != undefined) {
        urlParams.push({"index": [  global.config.elasticSearch.index.perfx360Index ], "ignore_unavailable": true },
            {"size": 10000, "aggs": {"nestedDocs": {"nested": {"path": "latencyStats"}, "aggs": {"latencyDetails": {"filter": {"term": {"latencyStats.headers.perfx-req-urlid": params.urlId} }, "aggs": {"latencyStats": {"stats": {"field": "latencyStats.latencyVal.latency"} } } } } } },"query": {"bool": {"must": [{"match": {"testExecutionId": params.testExecutionId} }, {"nested": {"path": "latencyStats", "query": {"bool": {"must": [{"match": {"latencyStats.headers.perfx-req-urlid" :  params.urlId } } ] } } } }], "must_not": [] } }, "_source": {"includes": ["latencyStats.*", "updatedMillis"] }, "version": true })

    }

    return urlParams;
};

module.exports = artilleryBuilderUtil;