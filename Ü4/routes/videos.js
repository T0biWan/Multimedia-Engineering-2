/** This module defines the routes for videos using the store.js as db memory
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)

// modules
var express = require('express');
var logger = require('debug')('me2u4:videos');
var store = require('../blackbox/store');

var router = express.Router();

// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};


// routes **********************
router.route('/') // = http://localhost:3000/videos
    .get(function(request, response, next) {
        var videos = store.select('videos');
        response.status(200).json(videos);
        next();
    })
    .post(function(request,response,next) {
        var id = store.insert('videos', request.body);
        response.status(201).json(store.select('videos', id));
        next();
    });

router.route('/:id') // = http://localhost:3000/videos/<id>
    .get(function(request, response, next) {
        var videos = store.select('videos');
        next();
    })
    .post(function(request,response,next) {
        // TODO
        next();
    });



// this middleware function can be used, if you like (or remove it)
router.use(function(request, response, next){
    // if anything to send has been added to response.locals.items
    if (response.locals.items) {
        // then we send it as json and remove it
        response.json(response.locals.items);
        delete response.locals.items;
    } else {
        // otherwise we set status to no-content
        response.set('Content-Type', 'application/json');
        response.status(204).end(); // no content;
    }
});

module.exports = router;
