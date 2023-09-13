//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate-v2'),
    timeZone = require('mongoose-timezone'),
    counter = require('../Counter'),
    SALT_WORK_FACTOR = 10;

var BinaryCutoffSchema = new Schema({
    seqId : {
        type: Number,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    cutoffDate: { type: Date},
    cutoffFrom : {type: Date},
    cutoffTo : {type: Date},
    cutoffStatus: {type : Boolean, default: false},
    timeTaken : {type : Number},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'binary_cutoff' });

BinaryCutoffSchema.pre('save', function(next) {
    var binaryCutoff = this;
    counter.findByIdAndUpdate({_id: '59678bf65a12076ff0cc7892'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error) return next(error);
        binaryCutoff.seqId = counter.seq;
        
        //console.info('counter.seq = ', binaryCutoff.seqId);
        if (!binaryCutoff.created) user.created = new Date;
        
        next();
    });
});

BinaryCutoffSchema.post('save', function(doc) {
   
});

BinaryCutoffSchema.plugin(mongoosePaginate);
BinaryCutoffSchema.plugin(timeZone);
// Compile model from schema
var BinaryCutoff = mongoose.model('BinaryCutoff', BinaryCutoffSchema );
// make this available to our BinaryCutoffs in our Node applications
module.exports = BinaryCutoff;