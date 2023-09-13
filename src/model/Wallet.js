
var mongoose = require('mongoose'),
timeZone = require('mongoose-timezone'),
Schema = mongoose.Schema;

var WalletSchema = new Schema({
walletId: {
    type: Number,
    required: true
},
walletName: {
    type: String,
    unique: true,
    required: true
},
walletDesc: {
    type: String,
    required: true
},
internal : {
    type: Boolean,
    default: false
},
active : {
    type: Boolean,
    default: true
},
created: { type: Date, default: Date.now },
updated: { type: Date, default: Date.now }
}, { collection: 'wallet' });
WalletSchema.plugin(timeZone);

var Wallet = mongoose.model('Wallet', WalletSchema );
module.exports = Wallet;