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
var storetools = require('../restapi/store-tools');
var filterware = require('../restapi/filter-middleware');
var limitoffsetware = require('../restapi/limitoffset-middleware');

var videos = express.Router();

const storeKey = 'videos';

var codes = {
    success: 200,
    created: 201,
    wrongrequest: 400,
    notfound: 404,
    wrongmethod: 405,
    wrongdatatyperequest: 406,
    wrongmediasend: 415,
    nocontent: 204
};

var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};


/* GET all videos */
videos.route('/')
    .get(function(req, res, next) {
        res.locals.items = store.select('videos');
        res.locals.processed = true;
        logger("GET fetched store items");
        next();
    })
    .post(function(req,res,next) {
        logger("POST calls storetoos to check required and opt keys");
        storetools.checkKeys(req.body, requiredKeys, optionalKeys, internalKeys);
        req.body.timestamp = new Date().getTime();
        logger("POST calls store.insert");
        var id = store.insert(storeKey, req.body);
        res.status(201);
        res.locals.items = store.select(storeKey, id);
        res.locals.processed = true;
        logger("POST fetched new element from store with id "+id);
        next();
    })
    .all(function(req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });

videos.route('/:id')
    .get(function(req, res,next) {
        res.locals.items = store.select('videos', req.params.id);
        res.locals.processed = true;
        logger("GET fetched store item");
        next();
    })
    .put(function(req, res,next) {
        // make a deep copy and merge required+internal
        var requiredForPUT = JSON.parse(JSON.stringify(requiredKeys));
        for (var key in internalKeys) {
            requiredForPUT[key] = internalKeys[key];
        }
        var id = null;
        logger("PUT calls storetools to check keys");
        storetools.checkKeys(req.body, requiredForPUT, optionalKeys, undefined);
        try { id = parseInt(req.params.id) }
        catch (e) {}
        if (id === req.body.id) {
            logger("PUT found id matching and stores item");
            store.replace(storeKey, req.body.id, req.body);
            res.status(200);
            res.locals.items = store.select(storeKey, id);
            res.locals.processed = true;
            logger("PUT stored the item");
            next();
        }
        else {
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body.id);
            err.status = codes.wrongrequest;
            next(err);
        }
    })
    .delete(function(req,res,next) {
        var id = null;
        try {
            id = parseInt(req.params.id);
            logger("DELETE calls store.remove");
            store.remove(storeKey, id);
            res.locals.processed = true;
            next();
        }
        catch (e) {
            var err = new Error('No element to delete with id ' + req.params.id);
            err.status = codes.notfound;
            next(err);
        }

    })
    .patch(function(req,res,next) {
        //TODO patch not yet supported
        var err = new Error('Unimplemented method!');
        err.status = 500;
        next(err);
    })
    .all(function(req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });

videos.use(limitoffsetware);  // uses res.locals.items and filters them with offset/limit
videos.use(filterware); // uses res.locals.items and applies attribute filters to them

/**
 * This middleware would finally send any data that is in res.locals to the client (as JSON) or, if nothing left, will send a 204.
 */
videos.use(function(req, res, next){
    if (res.locals.items) {
        res.json(res.locals.items);
        delete res.locals.items;
    } else if (res.locals.processed) {
        res.set('Content-Type', 'application/json');
        res.status(204).end(); // no content;
    } else {
        next(); // will result in a 404 from app.js
    }
});

module.exports = videos;
