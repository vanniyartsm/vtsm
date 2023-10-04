/**
 * Created by senthil on 03/10/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var PersonalInfoSchema = new Schema({
    maritalStatus: {type: String, required: true},
    education: {type: String},
    height: { type: SchemaTypes.Double },
    weight: { type: SchemaTypes.Double },
    address: {type: String},
    state : {type: String},
    city: {type: String},
    pincode: {type: String},
    country: {type: String}
})

var PersonalInfo = mongoose.model('PersonalInfo', PersonalInfoSchema );

module.exports = { PersonalInfoSchema, PersonalInfo};