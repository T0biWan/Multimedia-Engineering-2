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
var logger = require('debug')('me2u4:router');
var store = require('../blackbox/store');
var router = express.Router();

// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};


// routes **********************
router.route('/')
    .get(function(req, res, next) {
        var videos = store.select('videos');
        next();
    })
    .post(function(req,res,next) {
        var id = store.insert('router', req.body);
        res.status(201).json(store.select('router', id));
        next();
    });

router.route('/:id')
    .get(function(req, res, next) {
        var videos = store.select('videos');
        next();
    })
    .post(function(req,res,next) {
        // TODO
        next();
    });



// this middleware function can be used, if you like (or remove it)
router.use(function(req, res, next){
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

module.exports = router;
