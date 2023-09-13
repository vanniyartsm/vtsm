/**
 * Created by icomputers on 01/11/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    }
}, { collection: 'mail_providers' });

module.exports = mongoose.model('MailProvider', itemSchema, 'mail_providers');