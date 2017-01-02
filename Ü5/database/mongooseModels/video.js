/**
 * Created by Tobi Wan on 02.01.2017.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    _id:            {type: String, required: true},
    title:          {type: String, required: true},
    description:    {type: String, default: ''},
    src:            {type: String, required: true},
    length:         {type: Number, min: 0, required: true}, // min: 0 = 'nicht negative Zahl'?
    //length: {type: Number, min: [0, 'Whoops!'], required: true}, // Error-Handling bereits hier? // min: 0 = 'nicht negative Zahl'?
    timestamp:      {type: String, required: true},
    playcount:      {type: Number, min: 0, default: 0}, // min: 0 = 'nicht negative Zahl'?
    ranking:        {type: Number, min: 0, default: 0} // min: 0 = 'nicht negative Zahl'?
});

module.exports = mongoose.model('Model', schema);