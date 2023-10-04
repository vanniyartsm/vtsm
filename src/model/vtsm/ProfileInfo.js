/**
 * Created by senthil on 03/10/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProfileInfoSchema = new Schema({
    description: {type: String}, isDisable: {type: Boolean}
});

var ProfileInfo = mongoose.model('ProfileInfo', ProfileInfoSchema );
module.exports = { ProfileInfoSchema, ProfileInfo};