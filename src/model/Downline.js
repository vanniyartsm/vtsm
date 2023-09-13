
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var DownlineSchema = new Schema({
userId: {
    type: String
},
userName: {
    type: String
},
lot: {
    type: Number,
    required: true
},
fromUserId : {
    type: String
},
fromUserName: {
    type: String
},
created: { type: Date, default: Date.now },
updated: { type: Date, default: Date.now }
}, { collection: 'downline' });

var Downline = mongoose.model('Downline', DownlineSchema );
module.exports = Downline;