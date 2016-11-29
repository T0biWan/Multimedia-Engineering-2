/** This file contains the module exports for
 * the routes of REST-API to handle requests for
 * resource type "tweets"
 * Supports: GET, POST, PUT, DELETE
 * (This is a direct copy&paste from the CodePack solution;
 *  only change: 1.) instead of app. it uses tweets. which is a express.Router()
 *               2.) /tweets in all patterns moved
 *  )
 *
 * @author Johannes Konert
 * @licence  CC BY-SA 4.0
 *
 * @throws  Error if a method is not supported or parameter missing or id not found
 *
 * @module routes/tweets
 * @type {Router}
 */
"use strict";

// Import needed modules
var express = require('express');

// own modules imports
var store = require('../blackbox/store.js');
var hrefDecorator = require('../hrefid-decorator.js'); // task 2.a


// ** configure routes
var tweets = express.Router();

tweets.get('/', function(req,res,next) {
    res.json(hrefDecorator(req, '/tweets', store.select('tweets')));
});

tweets.post('/', function(req,res,next) {
    var id = store.insert('tweets', req.body); // TODO check that the element is really a tweet!
    // set code 201 "created" and send the item back (with new id)
    res.status(201).json(hrefDecorator(req, 'tweets', store.select('tweets', id)));
});


tweets.get('/:id', function(req,res,next) {
    res.json(hrefDecorator(req, '/tweets', store.select('tweets', req.params.id)));
});

tweets.delete('/:id', function(req,res,next) {
    store.remove('tweets', req.params.id);
    res.status(200).end();
});

tweets.put('/:id', function(req,res,next) {
    var err = undefined;
    if (req.params.id == req.body.id) {
        store.replace('tweets', req.params.id, req.body);
        res.status(200).end();
    } else {
        err = new Error("cannot replace element of id "+req.params.id+" with given element.id "+req.body.id);
        err.status = 400; // bad request
        next(err);
    }
});

module.exports = tweets;
