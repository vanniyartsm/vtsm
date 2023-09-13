
var mongoose = require('mongoose'),
SchemaTypes = mongoose.Schema.Types,
timeZone = require('mongoose-timezone'),
Schema = mongoose.Schema;
var userSchema = new Schema({ userId: {type: String}, userName : {type: String}, sponsorId : {type: String} });

var PurchaseUnitSchema = new Schema({
    user: userSchema,
    numberOfUnits: {
        type: Number
    },
    numberOfPoints: {
        type: Number
    },
    purchaseId: {
        type: String
    },
    type: {
        type: String
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'purchase_unit' });

PurchaseUnitSchema.plugin(timeZone);

var PurchaseUnit = mongoose.model('PurchaseUnit', PurchaseUnitSchema );

module.exports = PurchaseUnit;