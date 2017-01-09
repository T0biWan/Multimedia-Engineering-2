/** This module defines the routes for videos using a mongoose model
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */



// modules
var express = require('express');
var logger = require('debug')('me2u5:videos');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/data');
var VideoModel = require('../models/video');

var videos = express.Router();


// routes ******************************
videos.route('/')
    .get(function (request, respond, next) {
        respond.locals.processed = true;
        VideoModel.find({}, function (err, items) {
            if (!err) {
                if (items.length > 0) {
                    respond.status(201).json(items);
                } else {
                    respond.status(204).json();
                }
            } else {
                err.status = 400;
                err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                next(err);
            }
        });
    })
    .post(function (request, respond, next) {

        respond.locals.processed = true;
        // request.body.timestamp = new Date().getTime();
        var video = new VideoModel(request.body);

        video.save(function (err) {
            if (!err) {
                respond.status(201).json(video);
            } else {
                err.status = 400;
                err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                next(err);
            }
        });
    })
    .all(function (req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });


// Video Routes with ID*********

videos.route('/:id')
    .get(function (request, respond, next) {
        respond.locals.processed = true;

        VideoModel.findById(request.params.id, function (err, video) {
            if (!err) {
                respond.status(200).json(video).end();
            } else {
                err.status = 404;
                err.message = 'We could not find a video belonging to entered ID:' + request.params.id;
                next(err);
            }
        });

    })
    .put(function (req, res, next) {
        respond.locals.processed = true;

        var id = parseInt(req.params.id);
        if (id === req.body.id) {
            // TODO replace store and use mongoose/MongoDB
            // store.replace(storeKey, req.body.id, req.body);
            res.status(200);
            res.locals.items = store.select(storeKey, id);
            res.locals.processed = true;
            next();
        }
        else {
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body.id);
            err.status = codes.wrongrequest;
            next(err);
        }
    })
    .delete(function (request, respond, next) {
        respond.locals.processed = true;

        VideoModel.findByIdAndRemove(request.params.id, function (err, video) {
            if (!err) {
                respond.status(204).end();
            } else {
                err.status = 404;
                err.message = 'Unsuccessful extinguishing attempt for the video with the ID:' + request.params.id;
                next(err);
            }
        });

    })
    //
     .patch(function (request, respond, next) {
        respond.locals.processed = true;

        VideoModel.findByIdAndUpdate(id, request.body,
            {new: true, runValidators: true, setDefaultsOnInsert: true},
            function (err, video) {
                if (!err) {
                    res.status(200).json(video).end();
                } else {
                    err.status = 406;
                    err.message += '. The video with the ID: ' + req.params.id + ', could not be updated.';
                    next(err);
                }
            });
    })

    .all(function (req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });


// this middleware function can be used, if you like or remove it
// it looks for object(s) in res.locals.items and if they exist, they are send to the client as json
videos.use(function (req, res, next) {
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