/**
 * Created by senthil on 02/27/19.
 */

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var env = process.env.NODE_ENV || "development";
var path = require('path');
var express = require('express')
    , session = require('express-session')
    , morgan = require('morgan')
    , logger = require("./logger")
    , httpContext = require('express-http-context')
    , expressLayouts = require('express-ejs-layouts')
    , validator = require('express-validator')
    , cors = require('cors')
    , resEvents = require('./events')
    , rTracer = require('cls-rtracer');

exports.init = function (app) {
    app.use(cookieParser());
    app.use(session({
        secret: 'secretkey',
        name: 'quberos-page',
        proxy: true,
        resave: true,
        saveUninitialized: true
    }));
    app.use(bodyParser.json({limit: "50mb"}));
    app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
    app.use(express.json());
    app.use(express.urlencoded({extended : false }));
    app.use(cors());
    app.use(httpContext.middleware);
    app.use(rTracer.expressMiddleware())

    // view engine setup
    app.set('views', path.join(__dirname, '../../views'));
    app.set('view engine', 'ejs');
    app.use(expressLayouts);
    
    //app.set('layout extractScripts', true);
    //app.set('layout extractStyles', true);
    app.use(require('../../src'));
    app.set('json spaces', 5);

    app.use(morgan('combined', {"stream": logger.stream}));

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    /*if (env === "production") {
        app.use('*.js', function (req, res, next) {
            req.url = req.url + '.gz';
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', 'text/javascript');
            next();
        });
        app.use('*.css', function (req, res, next) {
            req.url = req.url + '.gz';
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', 'text/css');
            next();
        });
    }*/

    /*app.use(function(req, res, next) {
        if(!req.secure) {
          return res.redirect(['https://', req.get('Host'), req.url].join(''));
        }
        next();
      });*/

    app.use(express.static(path.join(__dirname, '../../dist')));
    app.use(express.static(path.join(__dirname, '../../public')));
    app.use(function (req, res, next) {
        //console.info('inside global method');
        res.locals.stuff = {
            query: req.query,
            url: req.originalUrl,
            req: req
        };
        res.locals.xhr = req.xhr;
        next();
    });

    

    app.use(function (err, req, res, next) {
        //res.status(500).send({"Error": err.stack});
        console.info('status : ', err);
        resEvents.emit('ErrorJsonResponse', req, res, {"status": err});
    });

    app.locals.context = '/web/';

}