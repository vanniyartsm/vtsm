
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AccountSchema = new Schema({
    accountId: {
        type: Number,
        required: true
    },
    accountName: {
        type: String,
        unique: true,
        required: true
    },
    accountDesc: {
        type: String,
        required: true
    },
    accountTypeId: {
        type: Number,
        required: true
    },
    active : {
        type: Boolean,
        default: true
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'account' });

var Account = mongoose.model('Account', AccountSchema );
module.exports = Account;