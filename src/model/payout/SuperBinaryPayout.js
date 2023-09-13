//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timeZone = require('mongoose-timezone'),
    mongoosePaginate = require('mongoose-paginate-v2');

var SuperBinaryPayoutSchema = new Schema({
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
    totalLeftLots: {
        type: Number
    },
    totalRightLots: {
        type: Number
    },
    totalLeftLotsCarryOver: {
        type: Number
    },
    totalRightLotsCarryOver: {
        type: Number
    },
    amount: { type: SchemaTypes.Double },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'super_binary_payout' });

SuperBinaryPayoutSchema.pre('save', function(next) {
    
});

SuperBinaryPayoutSchema.post('save', function(doc) {
   
});

SuperBinaryPayoutSchema.plugin(mongoosePaginate);
SuperBinaryPayoutSchema.plugin(timeZone);

// Compile model from schema
var SuperBinaryPayout = mongoose.model('SuperBinaryPayout', SuperBinaryPayoutSchema );
// make this available to our SuperBinaryPayouts in our Node applications
module.exports = SuperBinaryPayout;