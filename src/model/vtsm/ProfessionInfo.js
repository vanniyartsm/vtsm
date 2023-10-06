/**
 * Created by senthil on 03/10/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var ProfessionInfoSchema = new Schema({
    occupation: {type: String, required: true}, employed: {type: String}, annualIncome : { type: SchemaTypes.Double }, 
    workLocation: { type: SchemaTypes.Double }, workState: {type: String}, workCity: {type: String}, 
    residentStatus: {type: String}
});

var ProfessionInfo = mongoose.model('ProfessionInfo', ProfessionInfoSchema );
module.exports = { ProfessionInfoSchema, ProfessionInfo};