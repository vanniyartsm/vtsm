//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timeZone = require('mongoose-timezone'),
    mongoosePaginate = require('mongoose-paginate-v2');

var BinaryPayoutDetailSchema = new Schema({
    type: {
        type: String
    },
    userId: {
        type: String
    },
    userName: {
        type: String
    },
    puLeftBCount : {type : Number, default : 0},
    puRightBCount : {type : Number, default : 0},
    puLeftSBCount : {type : Number, default : 0},
    puRightSBCount : {type : Number, default : 0},
    puUserId: {
        type: String
    },
    puUserName: {
        type: String
    },
    transactionId: {
        type: String
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'binary_payout_detail' });

BinaryPayoutDetailSchema.pre('save', function(next) {
    var bpd = this;
    if (!bpd.created) bpd.created = new Date;
    next();
});

BinaryPayoutDetailSchema.post('save', function(doc) {
   
});

BinaryPayoutDetailSchema.plugin(mongoosePaginate);
BinaryPayoutDetailSchema.plugin(timeZone);

// Compile model from schema
var BinaryPayoutDetail = mongoose.model('BinaryPayoutDetail', BinaryPayoutDetailSchema );
// make this available to our BinaryPayouts in our Node applications
module.exports = BinaryPayoutDetail;