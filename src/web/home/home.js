/**
 * Created by senthil on 02/27/19.
 */

import express from 'express';
const app = express();

const _ = require('lodash')
    , renderConstants = require('../../commons/ui.constants');

app.get('/', function(req, res, next) {
    res.render(renderConstants.INDEX, { layout: 'layout', req: req });
});


app.get('/signup', function(req, res, next) {
    res.render(renderConstants.INDEX, { layout: 'layout', req: req });
});

module.exports = app;
