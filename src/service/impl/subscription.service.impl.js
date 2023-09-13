/**
 * Created by senthil on 08/04/17.
 */
var mongoose = require('mongoose')
    , resEvents = require('../../commons/events')
    , Utils = require('../../util/util')
    , SALT_WORK_FACTOR = 10
    , BaseError = require('../../commons/BaseError')
    , _ = require('lodash')
    , constants = require('../../commons/constants')
    , logger = require('../../commons/logger')
    , baseService = require('../../commons/base.service');

var Subscription = require('../../model/Subscription');
var UserSubscription = require('../../model/UserSubscription');


function getAllSubscriptions (callback) {
    Subscription.find({"status" : "true"}, function (err, subscriptions) {
        callback(err, subscriptions);
    });
}
exports.getAllSubscriptions = getAllSubscriptions;

function getSubscription(subscriptionId, callback) {
    Subscription.findOne({ _id: subscriptionId}, function(err, subscription) {
        if (_.isEmpty(subscription)) {
            var baseError = new BaseError(Utils.buildErrorResponse(constants.SUBSCRIPTION_NOT_FOUND, '', constants.SUBSCRIPTION_NOT_FOUND_MSG, constants.USER_NAME_NOT_FOUND_MSG, 500));
            callback(baseError, subscription);
        } else {
            callback(err, subscription);
        }
    });
}

exports.getSubscription = getSubscription;


function saveSubscription (subscriptionJson, callback) {
    var subscription = new Subscription({
        username: userJson.username,
        password: userJson.password,
        firstName : userJson.firstName,
        lastName : userJson.lastName,
        emailAddress: userJson.emailAddress,
        phoneNo: userJson.phoneNo
    });

    // save subscription to database
    subscription.save(function(err) {
       callback(err, subscription);
    });
}
exports.saveSubscription = saveSubscription;

function saveUserSubscription (userSubscription, callback) {

    // save subscription to database
    userSubscription.save(function(err) {
        callback(err, userSubscription);
    });
}
exports.saveUserSubscription = saveUserSubscription;

function getSubscriptionsCount(callback) {
    Subscription.count({}, function( err, count){
        callback(err, count);
    })
}
exports.getSubscriptionsCount = getSubscriptionsCount;

function bootstrapSubscriptionsData(callback) {
    var subscriptions = [{"_id":"69aaa6d3c41e02a7cefb1000","name":"FREE","description":"Free Subscription Package","order":1,"status":true, "amount" : 0.00, "percentage" : 0, "parentId" : "-1", "validity" : "14", "subscriptionType" : "DAYS", "features" : {"Projects" : "1", "Applications" : "1" , "Tests" : "1", "Phases": "3", "ConcurrentUsers" : "50", "Scenarios" : "10"}},
        {"_id":"69aaa6d3c41e02a7cefb2000","name":"Basic","description":"Basic Month Subscription Package","order":2,"status":true, "amount" : 100.00, "percentage" : 0, "parentId" : "-1", "validity" : "1", "subscriptionType" : "MONTH", "features" : {"Projects" : "2", "Applications" : "5" , "Tests" : "5", "Phases": "4", "ConcurrentUsers" : "1000", "Scenarios" : "20"}},
        {"_id":"69aaa6d3c41e02a7cefb2001","name":"Basic","description":"Basic Year Subscription Package","order":2,"status":true, "amount" : 1000.00, "percentage" : 0, "parentId" : "-1", "validity" : "1", "subscriptionType" : "YEAR", "features" : {"Projects" : "2", "Applications" : "5" , "Tests" : "60", "Phases": "4", "ConcurrentUsers" : "1000", "Scenarios" : "20"}},
        {"_id":"69aaa6d3c41e02a7cefb3000","name":"Pro","description":"Pro Month Subscription Package","order":3,"status":true, "amount" : 300.00, "percentage" : 0, "parentId" : "-1", "validity" : "1", "subscriptionType" : "MONTH", "features" : {"Projects" : "4", "Applications" : "5" , "Tests" : "10", "Phases": "10", "ConcurrentUsers" : "4000", "Scenarios" : "80"}},
        {"_id":"69aaa6d3c41e02a7cefb3001","name":"Pro","description":"Pro Year Subscription Package","order":3,"status":true, "amount" : 2500.00, "percentage" : 0, "parentId" : "-1", "validity" : "1", "subscriptionType" : "YEAR", "features" : {"Projects" : "4", "Applications" : "5" , "Tests" : "100", "Phases": "10", "ConcurrentUsers" : "4000", "Scenarios" : "80"}}];

    Subscription.insertMany(subscriptions, function (err, results) {
        console.info('err = ', err);
        callback(err, results);
    });
}
exports.bootstrapSubscriptionsData = bootstrapSubscriptionsData;