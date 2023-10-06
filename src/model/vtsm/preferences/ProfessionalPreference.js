//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProfessionalPreferenceSchema = new Schema({
    education: {type: String}, educationCompulsory : { type: Boolean, default: false },
    employedIn: {type: String}, employedInCompulsory : { type: Boolean, default: false },
    occupation: {type: String}, occupationCompulsory : { type: Boolean, default: false },
    annualIncomeFrom: {type: String}, annualIncomeTo: {type: String}, annualIncomeCompulsory : { type: Boolean, default: false }
});

var ProfessionalPreferenceInfo = mongoose.model('vtsm_partner_preference_professional', ProfessionalPreferenceSchema);

module.exports = { ProfessionalPreferenceSchema, ProfessionalPreferenceInfo};