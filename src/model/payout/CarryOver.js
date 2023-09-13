//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    SchemaTypes = mongoose.Schema.Types,
    timeZone = require('mongoose-timezone'),
    mongoosePaginate = require('mongoose-paginate-v2');

var CarryOverSchema = new Schema({
    cutoffId: { type: String },
    user: {type: Schema.ObjectId, ref: 'User'},
    leftBCarryOver: { type: Number, default : 0 },
    rightBCarryOver: { type: Number, default : 0 },
    leftSBCarryOver : { type: Number, default : 0 },
    rightSBCarryOver : { type: Number, default : 0 },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'binary_payout' });

CarryOverSchema.pre('save', function(next) {
    var bp = this;
    if (!bp.created) bp.created = new Date;
    next();
});

CarryOverSchema.post('save', function(doc) {
   
});

CarryOverSchema.plugin(mongoosePaginate);
CarryOverSchema.plugin(timeZone);

// Compile model from schema
var CarryOver = mongoose.model('CarryOver', CarryOverSchema );
// make this available to our CarryOvers in our Node applications
module.exports = CarryOver;