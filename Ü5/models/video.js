/**
 * Created by Tobi Wan on 02.01.2017.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title:          {type: String, required: true},
    description:    {type: String, default: ''},
    src:            {type: String, required: true},
    length:         {type: Number, min: 0, required: true},
    playcount:      {type: Number, min: 0, default: 0},
    ranking:        {type: Number, min: 0, default: 0}
},{
    timestamp:      {createdAt: 'timestamp'}
});

module.exports = mongoose.model('Video', schema);