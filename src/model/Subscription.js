/**
 * Created by senthil on 05/07/17.
 */
var mongoose = require('mongoose');
var mongooseDouble = require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var subscriptionSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    order: {type: Number},
    status: {type: Boolean},
    amount: { type: SchemaTypes.Double },
    percentage: { type: SchemaTypes.Double },
    subscriptionType: {type: String},
    features : {type: Object},
    parentId: {type: String},
    validity: {type: String},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'subscriptions' });

subscriptionSchema.pre('save', function(next) {
    if (!this.created) this.created = new Date;
    next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema, 'Subscription');