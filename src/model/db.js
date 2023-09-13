/**
 * Created by senthil on 23/03/17.
 */

//Import the mongoose module
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var logger = require('../commons/logger');

const options = {
    // user:"quberos_admin",
    // pass:"admin@4321",
    native_parser: true,
    poolSize: 5,
    autoIndex: false, // Don't build indexes
    bufferMaxEntries: 0,
    connectWithNoPrimary: true ,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

//Set up default mongoose connection
var mongoUrl = 'mongodb://' + global.config.mongodb.host + ":" + global.config.mongodb.port + "/" + global.config.mongodb.dbName + '?authSource=admin&retryWrites=true&w=majority';

var mongoDB = process.env.MONGODB_URI || mongoUrl;
logger.info('connecting mongo');
mongoose.connect(mongoDB, options);
//mongoose.Promise = global.Promise;
mongoose.Promise = require('bluebird');
mongoose.Promise = require('q').Promise;
var db = mongoose.connection;
db.on('error', function (err) {
  console.info('err = ', err);
  logger.err('Mongo Connection err : ', err);
});

module.exports = db;
