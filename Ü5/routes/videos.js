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
// Creating Model for requests with Scheme from ('../models/video')
var VideoModel = require('../models/video');

var videos = express.Router();


// Video routes without ID ******************************
videos.route('/')
/**
 * find all videos in database and respond with status 201
 *      if there is no video object in the db, respond with status 204 and the empty body
 *      if there is no db respond with status 400 and show errormessage
 */
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
    /**
     * Using the defined Scheme in VideoModel to check on consistence and create errors if datatypes are wrong or missing
     *      if there are no errors insert the new object and respond with status 201 and the created object
     *      otherwise join all errors and respond with status 400
     */
    .post(function (request, respond, next) {

        respond.locals.processed = true;
        // request.body.timestamp = new Date().getTime();
        // Using VideoModel to just edit fields which are defined in the Scheme
        var video = new VideoModel(request.body);

        // check on consistence and create error if datatype is missing/wrong
        video.save(function (err) {
            if (!err) {
                respond.status(201).json(video);
            } else {
                err.status = 400;
                err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors); //slide 67
                next(err);
            }
        });
    })

    /**
     * catch all other methodes and respond that these are not allowed on this route
     */
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
/**
 * Method to find video by ID and then respond with status 200 and video object
 *      if there is no video with this ID or any other error, respond with status 404 and errormessage
 *
 */
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

    /**
     * Method to update video by ID and then respond with status 201
     * For every key, check if there is a property in the request body and update it in this case
     * ignore __v and timestamp
     *      If there is no video with this ID or any other error, respond with status 405 and errormessage
     */
    .put(function (req, res, next) {
        // to respond with a modified object
        respond.locals.processed = true;

        // if ID from route is same as ID from body create new empty video object
        if (request.params.id == request.body._id) {
            var video = {};
            var schema = videoModel.schema;

            // check for every key in object if there is a property for in the request body
            //      when there is a property for a key, set the value key from the request body
            Object.keys(schema.paths).forEach(function (key) {
                if (request.body.hasOwnProperty(key)) video[key] = request.body[key];
                // if there is no property for the key in the request body and it has to be a default value, set it to default
                //      otherwise set the key to undefined
                else {
                    if (schema.paths[key].options.default !== undefined) video[key] = schema.paths[key].options.default;
                    else video[key] = undefined;
                }
            });

            video['updatedAt'] = Date.now();
            // ignore __v and timestamp
            delete video.__v;
            delete video.timestamp;


            videoModel.findByIdAndUpdate(request.params.id, video, {runValidators: true, new: true}, function (err, video) {
                if (err) next(err);
                else respond.status(201).json(video).end();
            });
        } else {
            var err = new Error('ID mismatch between request and given Object: ' + request.params.id + ' != ' + request.body._id);
            err.status = 405; //TODO: richtiger status? vielleicht 400??
            next(err);
        }
    })

    /**
     * Method to delete video by ID and then respond with status 204
     *      if there is no video with this ID or any other error, respond with status 404 and errormessage
     */
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
    /**
     * Method to patch video by ID and then respond with status 200 and the updated video object
     *      if there is no video with this ID or any other error, respond with status 406 and (joined) errormessages
     */
     .patch(function (request, respond, next) {
        respond.locals.processed = true;

         // flags to validate requestbody and set default values from scheme
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
     /**
      * catch all other methodes and respond that these are not allowed on this route
      */
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