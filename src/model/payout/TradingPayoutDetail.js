//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timeZone = require('mongoose-timezone'),
    mongoosePaginate = require('mongoose-paginate-v2');

var userSchema = new Schema({ userId: {type: String}, userName : {type: String}, sponsorId : {type: String} });
var TradingPayoutDetailSchema = new Schema({
    user: userSchema,
    numberOfUnits: {
        type: Number
    },
    numberOfPoints: {
        type: Number
    },
    purchaseId: {
        type: String
    },
    type: {
        type: String
    },
    creditDate : { type: Date },
    creditStatus : {type: String},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'trading_payout_detail' });

TradingPayoutDetailSchema.pre('save', function(next) {
    var bpd = this;
    if (!bpd.created) bpd.created = new Date;
    next();
});

TradingPayoutDetailSchema.post('save', function(doc) {
   
});

TradingPayoutDetailSchema.plugin(mongoosePaginate);
TradingPayoutDetailSchema.plugin(timeZone);

// Compile model from schema
var TradingPayoutDetail = mongoose.model('TradingPayoutDetail', TradingPayoutDetailSchema );
// make this available to our TradingPayouts in our Node applications
module.exports = TradingPayoutDetail;