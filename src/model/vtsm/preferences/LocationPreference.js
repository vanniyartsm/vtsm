//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LocationPreferenceSchema = new Schema({
    country: {type: String}, countryCompulsory : { type: Boolean, default: false }
});

var LocationPreferenceInfo = mongoose.model('vtsm_partner_preference_location', LocationPreferenceSchema);

module.exports = { LocationPreferenceSchema, LocationPreferenceInfo};