
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AccountTypeSchema = new Schema({
    accountTypeId: {
        type: Number
    },
    accountTypeName: {
        type: String,
        unique: true,
        required: true
    },
    accountTypeDesc: {
        type: String,
        required: true
    },
    active : {
        type: Boolean,
        default: true
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'account_type' });

var AccountType = mongoose.model('AccountType', AccountTypeSchema );
module.exports = AccountType;