//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BasicPreferenceSchema = new Schema({
    ageFrom: {type: Number}, ageTo: {type: Number}, ageCompulsory : { type: Boolean, default: false },
    heightFeetFrom: {type: Number}, heightInchFrom: {type: Number}, heightFeetTo: {type: Number}, heightInchTo: {type: Number},
    heightCompulsory : { type: Boolean, default: false },
    maritalStatus: {type: String}, maritalStatusCompulsory : { type: Boolean, default: false },
    physicalStatus: {type: String}, physicalCompulsory : { type: Boolean, default: false },
    eatingHabits: {type: String}, eatingHabitsCompulsory : { type: Boolean, default: false },
    drinkingHabits: {type: String}, drinkingHabitsCompulsory : { type: Boolean, default: false },
    smokingHabits: {type: String}, smokingHabitsCompulsory : { type: Boolean, default: false }
});

var BasicPreferenceInfo = mongoose.model('vtsm_partner_preference_basic', BasicPreferenceSchema);

module.exports = { BasicPreferenceSchema, BasicPreferenceInfo};