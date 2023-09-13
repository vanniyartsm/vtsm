/**
 * Created by senthil on 05/07/17.
 */
var mongoose = require('mongoose');
var mongooseDouble = require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var userSubscriptionSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    subscription: {type: Schema.ObjectId, ref: 'Subscription'},
    referrer: {type : String},
    orderNo: {type : String},
    amount: { type: SchemaTypes.Double },
    validity: { type: Date, default: Date.now },
    order: {type: Number},
    status: {type: Boolean},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'user_subscriptions' });

userSubscriptionSchema.pre('save', function(next) {
    if (!this.created) this.created = new Date;
    next();
});

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema, 'user_subscriptions');