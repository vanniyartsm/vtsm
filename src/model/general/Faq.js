
var mongoose = require('mongoose'),
SchemaTypes = mongoose.Schema.Types,
timeZone = require('mongoose-timezone'),
Schema = mongoose.Schema;

var FaqSchema = new Schema({
    title: { type: String },
    description: { type: String },
    type: { type: String },
    status: { type: String},
    order: {type: Number},
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'general_faqs' });

FaqSchema.plugin(timeZone);

var Faq = mongoose.model('faq', FaqSchema );

module.exports = Faq;