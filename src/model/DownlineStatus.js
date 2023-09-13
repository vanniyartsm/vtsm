
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var DownlineStatusSchema = new Schema({
userId: {
    type: String
},
userName: {
    type: String
},
status: {
    type: String
},
statusId: {
    type: Number
},
created: { type: Date, default: Date.now },
updated: { type: Date, default: Date.now }
}, { collection: 'downline_status' });

var DownlineStatus = mongoose.model('DownlineStatus', DownlineStatusSchema );
module.exports = DownlineStatus;