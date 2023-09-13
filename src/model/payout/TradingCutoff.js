//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timeZone = require('mongoose-timezone'),
    mongoosePaginate = require('mongoose-paginate-v2'),
    counter = require('../Counter'),
    SALT_WORK_FACTOR = 10;

var TradingCutoffSchema = new Schema({
    seqId : {
        type: Number,
        unique: true
    },
    type: {
        type: String
    },
    cutoffDate: { type: Date},
    cutoffFrom : {type: Date},
    cutoffTo : {type: Date},
    cutoffStatus: {type : Boolean, default: false},
    timeTaken : {type : Number},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'trading_cutoff' });

TradingCutoffSchema.pre('save', function(next) {
    var binaryCutoff = this;
    counter.findByIdAndUpdate({_id: '59678bf65a12076ff0cc7893'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error) return next(error);
        binaryCutoff.seqId = counter.seq;
        
        //console.info('counter.seq = ', binaryCutoff.seqId);
        if (!binaryCutoff.created) user.created = new Date;
        
        next();
    });
});

TradingCutoffSchema.post('save', function(doc) {
   
});

TradingCutoffSchema.plugin(mongoosePaginate);
TradingCutoffSchema.plugin(timeZone);

// Compile model from schema
var TradingCutoff = mongoose.model('TradingCutoff', TradingCutoffSchema );
// make this available to our TradingCutoff in our Node applications
module.exports = TradingCutoff;