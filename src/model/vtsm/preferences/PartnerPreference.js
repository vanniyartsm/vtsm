var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate-v2'),
    timeZone = require('mongoose-timezone'),
    mongooseRecursiveUpsert = require('mongoose-recursive-upsert');

var { BasicPreferenceSchema } = require('./BasicPreference')
var { ReligiousPreferenceSchema } = require('./ReligiousPreference')
var { ProfessionalPreferenceSchema } = require('./ProfessionalPreference')
var { LocationPreferenceSchema } = require('./LocationPreference')

var PartnerPreferenceSchema = new Schema({
    ppId: { type: String, required: true },
    member: {type: Schema.Types.ObjectId, ref: 'Member'},
    basicPreference: BasicPreferenceSchema,
    religiousPreference: ReligiousPreferenceSchema,
    professionalPreference: ProfessionalPreferenceSchema,
    locationPreference: LocationPreferenceSchema,
    active : {
        type: Boolean,
        default: false
    },
    created: { type: Date, default: Date.now }, 
    updated: { type: Date, default: Date.now }
}, { collection: 'vtsm_partner_preference' });

PartnerPreferenceSchema.plugin(mongoosePaginate);
PartnerPreferenceSchema.plugin(mongooseRecursiveUpsert);
PartnerPreferenceSchema.plugin(timeZone);

// Compile model from schema
var PartnerPreference = mongoose.model('PartnerPreference', PartnerPreferenceSchema );

// make this available to our users in our Node applications
module.exports = PartnerPreference;