var env = process.env.NODE_ENV || "development";
global.config = require('./config/config.json')[env];
console.info('process.env.NODE_ENV = ', process.env.NODE_ENV);
import express from 'express'
var http = require('http');
const app = express();
var _ = require('lodash');
const https = require('https');
const fs = require('fs');
var moment = require('moment')
var favicon = require('serve-favicon');
var configure = require('./src/commons/configure');
var bootstrap = require('./src/commons/bootstrap');

//var awsEmail = require('./src/commons/sample/aws-email');
//var asyncexp = require('./src/commons/async-exp');
//var promiseTutorial = require('./src/tutorials/promise/async');

var db = require('./src/model/db');
var renderConstants = require('./src/commons/ui.constants');
var payoutScheduler = require('./src/scheduler/payout.scheduler');
import 'dotenv/config';
//console.log('Quberos project.');
//console.log(process.env.MY_SECRET);
//var Promise = require('promise');
configure.init(app);
bootstrap.bootstrapInit();

app.get('/status', function(req, res) {
    res.send({'status' : 'true'});
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res, next){

    var locals = {
        title: 'Page Title',
        description: 'Page Description',
        header: 'Page Header'
    };
    //logMetricsMiddleware(req, res, next);

    res.render(renderConstants.INDEX_NOT_FOUND, { layout: 'layout', req: req });
});

http.createServer(app).listen(global.config.server.port, function () {
    console.log('Quberos server listening on port ', global.config.server.port);
});


// we will pass our 'app' to 'https' server
/*https.createServer({
    key: fs.readFileSync('./docs/keys/server.pem'),
    cert: fs.readFileSync('./docs/keys/server.crt'),
    passphrase: 'quberosadmin'
}, app)
.listen(443);*/

function logMetricsMiddleware (req, res, next) {
    res.on('finish', () => {
        console.info('res finish');
    });
};

module.exports = app;
