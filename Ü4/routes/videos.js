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

var videos = express.Router();

// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};


// routes **********************
videos.route('/videos/')
    .get(function(request, response, next) {
        var videos = store.select('videos');
        response.status(200).json(videos);
        next();
    })
    .post(function(req,res,next) {
        // TODO
        next();
    });
// TODO

// CRUD Operations for ID route
videos.route('/:id')
    .get(function (request,respond,next) {
     var  videoSelection = store.select('videos',req.params.id);
        if(videoSelection === undefined) {
            respond.status(404).json("{}");
        }
        else {respond.status(200).json(videoSelection)}
    })
    .post(function (request,respond,next) {
        next();
        
    })

    .put(function (request,respond,next) {
        store.replace('videos', request.params.id, request.body);
        respond.status(200).end();


    })
    .delete (function(request,respond,next) {
        store.remove('videos', request.params.id);
        respond.status(200).end(); });

// this middleware function can be used, if you like (or remove it)
videos.use(function(req, res, next){
    // if anything to send has been added to res.locals.items
    if (res.locals.items) {
        // then we send it as json and remove it
        res.json(res.locals.items);
        delete res.locals.items;
    } else {
        // otherwise we set status to no-content
        res.set('Content-Type', 'application/json');
        res.status(204).end(); // no content;
    }
});

module.exports = videos;
