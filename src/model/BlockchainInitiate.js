
var mongoose = require('mongoose'),
SchemaTypes = mongoose.Schema.Types,
timeZone = require('mongoose-timezone'),
Schema = mongoose.Schema;

var userSchema = new Schema({ userId: {type: String}, userName : {type: String}, sponsorId : {type: String} });

var BlockchainInitiateSchema = new Schema({
    user: userSchema,
    address: { type: String },
    addressType: { type: String },
    value: { type: SchemaTypes.Double },
    usd: { type: SchemaTypes.Double },
    points: { type: SchemaTypes.Double },
    transactionHash: { type: String },
    initiated : { type: Boolean, default: false },
    deposited : { type: Boolean, default: false },
    approved : { type: Boolean, default: false },
    rejected : { type: Boolean, default: false },
    requested : { type: Boolean, default: false },
    requestedStatus: { type: String},
    requestedCancelled : { type: Boolean, default: false },
    requestedReason: { type: String},
    initiatedDate: { type: Date, default: Date.now },
    depositedDate: { type: Date, default: Date.now },
    approvedDate: { type: Date, default: Date.now },
    rejectedDate: { type: Date, default: Date.now },
    requestedDate: { type: Date, default: Date.now },
    comments: { type: String},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'blockchain_initiate' });

BlockchainInitiateSchema.plugin(timeZone);

var BlockchainInitiate = mongoose.model('BlockchainInitiate', BlockchainInitiateSchema );

module.exports = BlockchainInitiate;