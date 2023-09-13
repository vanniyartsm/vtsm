//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    SchemaTypes = mongoose.Schema.Types,
    timeZone = require('mongoose-timezone'),
    mongoosePaginate = require('mongoose-paginate-v2');

var BinaryPayoutSchema = new Schema({
    cutoffId : {
        type: String
    },
    cutoffDate : {
        type: Date
    },
    type: {
        type: String
    },
    user: {type: Schema.ObjectId, ref: 'User'},
    leftBCount: { type: Number, default : 0 },
    rightBCount: { type: Number, default : 0 },
    leftSBCount : { type: Number, default : 0 },
    rightSBCount : { type: Number, default : 0 },
    leftBCarryOver: { type: Number, default : 0 },
    rightBCarryOver: { type: Number, default : 0 },
    leftSBCarryOver : { type: Number, default : 0 },
    rightSBCarryOver : { type: Number, default : 0 },
    binaryPair : { type: Number, default : 0 },
    superBinaryPair : { type: Number, default : 0 },
    transactionId : { type: String },
    binaryPayout: { type: SchemaTypes.Double },
    superBinaryPayout: { type: SchemaTypes.Double },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'binary_payout' });

BinaryPayoutSchema.pre('save', function(next) {
    var bp = this;
    if (!bp.created) bp.created = new Date;
    next();
});

BinaryPayoutSchema.post('save', function(doc) {
   
});

BinaryPayoutSchema.plugin(mongoosePaginate);
BinaryPayoutSchema.plugin(timeZone);

// Compile model from schema
var BinaryPayout = mongoose.model('BinaryPayout', BinaryPayoutSchema );
// make this available to our BinaryPayouts in our Node applications
module.exports = BinaryPayout;