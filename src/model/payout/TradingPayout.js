//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    SchemaTypes = mongoose.Schema.Types,
    timeZone = require('mongoose-timezone'),
    mongoosePaginate = require('mongoose-paginate-v2');

var TradingPayoutSchema = new Schema({
    cutoffId : {
        type: String
    },
    type: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    tradeNumber: {
        type: Number
    },
    amount: { type: SchemaTypes.Double },
    totalLots: {
        type: Number
    },
    purchaseLotId : {
        type: String
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'trading_payout' });

TradingPayoutSchema.pre('save', function(next) {
    
});

TradingPayoutSchema.post('save', function(doc) {
   
});

TradingPayoutSchema.plugin(mongoosePaginate);
TradingPayoutSchema.plugin(timeZone);

// Compile model from schema
var TradingPayout = mongoose.model('TradingPayout', TradingPayoutSchema );
// make this available to our TradingPayouts in our Node applications
module.exports = TradingPayout;