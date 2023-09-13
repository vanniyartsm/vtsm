import express from 'express';
const app = express();
const ping = require('./ping')
    , initFilter = require('../commons/filter')
    , userApi = require('./user.api')
    , ledgerApi = require('./ledger.api')
    , pointsApi = require('./points.api')
    , downlineApi = require('./downline.api')
    , dashboardApi = require('./dashboard.api')
    , generalApi = require('./general.api')
    , adminApi = require('./admin.api');

var v1 = '/v1';

app.all(v1 + '*', initFilter.initValidation);

//app.use(rv1 + '/ping', ping);
app.use(v1 + '/user', userApi);

app.use(v1 + '/ledger', ledgerApi);

app.use(v1 + '/points', pointsApi);

app.use(v1 + '/downline', downlineApi);

app.use(v1 + '/dashboard', dashboardApi);

app.use(v1 + '/general', generalApi);

app.use(v1 + '/admin', adminApi);

module.exports = app;
