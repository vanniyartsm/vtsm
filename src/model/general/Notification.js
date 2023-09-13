
var mongoose = require('mongoose'),
SchemaTypes = mongoose.Schema.Types,
timeZone = require('mongoose-timezone'),
Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    title: { type: String },
    description: { type: String },
    type: { type: String },
    status: { type: String},
    order: {type: Number},
    days: {type: Number},
    from: { type: Date},
    to: { type: Date },
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'general_notifications' });

NotificationSchema.plugin(timeZone);

var Notification = mongoose.model('Notification', NotificationSchema );

module.exports = Notification;