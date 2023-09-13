
var mongoose = require('mongoose'),
SchemaTypes = mongoose.Schema.Types,
timeZone = require('mongoose-timezone'),
Schema = mongoose.Schema;

var userSchema = new Schema({ userId: {type: String}, userName : {type: String}, sponsorId : {type: String} });

var WithdrawSchema = new Schema({
    user: userSchema,
    address: { type: String },
    addressType: { type: String },
    value: { type: SchemaTypes.Double },
    usd: { type: SchemaTypes.Double },
    points: { type: SchemaTypes.Double },
    requested : { type: Boolean, default: false },
    requestedDate: { type: Date},
    status: { type: String},
    approved : { type: Boolean, default: false },
    approvedDate: { type: Date},
    rejected : { type: Boolean, default: false },
    rejectedDate: { type: Date},
    rejectedNotes: { type: String},
    deposited : { type: Boolean, default: false },
    depositedDate: { type: Date},
    comments: { type: String},
    transactionId: {type: String},
    wallet: {type: Schema.Types.ObjectId, ref: 'Wallet'},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'withdraw' });

WithdrawSchema.plugin(timeZone);

var Withdraw = mongoose.model('Withdraw', WithdrawSchema );

module.exports = Withdraw;