
var mongoose = require('mongoose'),
    mongooseDouble = require('mongoose-double')(mongoose),
    SchemaTypes = mongoose.Schema.Types,
    timeZone = require('mongoose-timezone'),
    Schema = mongoose.Schema;

var LedgerSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    userName: {type: String},
    wallet: {type: Schema.Types.ObjectId, ref: 'Wallet'},
    walletId: { type : Number },
    account: {type: Schema.Types.ObjectId, ref: 'Account'},
    accountId: { type : Number },
    accountName: {
        type: String
    },
    accountTypeId: { type : Number },
    accountType: {type: Schema.Types.ObjectId, ref: 'AccountType'},
    accountTypeName: {
        type: String
    },
    credit: { type: SchemaTypes.Double },
    debit: { type: SchemaTypes.Double },
    from: { type: String},
    type: { type: String},
    transferUser : {
        type: Object
    },
    purchaseId : { type : String },
    transactionId : { type : String },
    cutoffId : { type : String },
    payoutType: { type: String},
    purchaseUnitId : {type: Schema.Types.ObjectId, ref: 'PurchaseUnit'},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'ledger' });

LedgerSchema.plugin(timeZone);

var Ledger = mongoose.model('Ledger', LedgerSchema );

module.exports = Ledger;