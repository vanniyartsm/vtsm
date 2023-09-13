
var mongoose = require('mongoose'),
timeZone = require('mongoose-timezone'),
Schema = mongoose.Schema;

var CounterSchema = new mongoose.Schema({
    type: {type: String, required: true},
    seq: { type: Number, default: 0 }
}, { collection: 'counter' });

CounterSchema.plugin(timeZone);
var Counter = mongoose.model('Counter', CounterSchema );

module.exports = Counter;