//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReligiousPreferenceSchema = new Schema({
    religion: {type: String}, ageCompulsory : { type: Boolean, default: false },
    caste: {type: String}, casteCompulsory : { type: Boolean, default: false },
    dosham: {type: String}, doshamCompulsory : { type: Boolean, default: false },
    star: {type: String}, starCompulsory : { type: Boolean, default: false }
});

var ReligiousPreferenceInfo = mongoose.model('vtsm_partner_preference_religious', ReligiousPreferenceSchema);

module.exports = { ReligiousPreferenceSchema, ReligiousPreferenceInfo};