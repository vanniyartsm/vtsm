/**
 * Created by senthil on 03/10/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FamilyReligionInfoSchema = new Schema({
    fatherName: {type: String}, motherName: {type: String}, sisters: { type: Number }, 
    brothers: { type: Number }, rasi: {type: String}, natchathram : {type: String}, lagnam: {type: String}, 
    gothram: {type: String}, dosham: {type: String}
});

var FamilyReligionInfo = mongoose.model('FamilyReligionInfo', FamilyReligionInfoSchema );

module.exports = { FamilyReligionInfoSchema, FamilyReligionInfo};