/**
 * Created by senthil on 02/27/19.
 */
import express from 'express';
const app = express();

var apiIndex = require('./api/index');
var webIndex = require('./web/index');

var apiContext = "/rest/api"
var webContext = "/"

// API Index
app.use(apiContext, apiIndex);

//Web UI Index

/* GET home page. */
app.use(webContext, webIndex);

module.exports = app;