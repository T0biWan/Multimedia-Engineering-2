/**
 * This Scheme defines the structure for the following Collection Scheme ("VideoScheme")
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VideoSchema = new Schema({
    title:          {type: String, required: true},
    description:    {type: String, default: ''},
    src:            {type: String, required: true},
    length:         {type: Number, min: 0, required: true},
    playcount:      {type: Number, min: 0, default: 0},
    ranking:        {type: Number, min: 0, default: 0}
},{
    // this options-object allows to set timestamp automatically
    timestamp:      {createdAt: 'timestamp'}
});

// creating Constructorfunction which offer static functions like find() oder update()
module.exports = mongoose.model('Video', VideoSchema);