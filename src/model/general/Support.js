
var mongoose = require('mongoose'),
SchemaTypes = mongoose.Schema.Types,
timeZone = require('mongoose-timezone'),
Schema = mongoose.Schema;

var userSchema = new Schema({ userId: {type: String}, userName : {type: String}, sponsorId : {type: String} });

var SupportSchema = new Schema({
    ticketNo : { type: String },
    user: userSchema,
    subject: { type: String },
    description: { type: String },
    reason: { type: String },
    department: { type: String },
    initiated : { type: Boolean, default: false },
    responded : { type: Boolean, default: false },
    reinitiated : { type: Boolean, default: false },
    closed : { type: Boolean, default: false },
    status: { type: String},
    replied : { type: Boolean, default: true },
    initiatedDate: { type: Date, default: Date.now },
    respondedDate: { type: Date, default: Date.now },
    reinitiatedDate: { type: Date, default: Date.now },
    closeddDate: { type: Date, default: Date.now },
    replies: { type: Object},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'general_support_tickets' });

SupportSchema.plugin(timeZone);

var Support = mongoose.model('Support', SupportSchema );

module.exports = Support;