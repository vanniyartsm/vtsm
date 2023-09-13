var mongoose = require('mongoose');
mongoose.set('debug', true);

//Skill schema definition

var skillSchema = new mongoose.Schema({
  name: String,
  length: String,
});

var Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;