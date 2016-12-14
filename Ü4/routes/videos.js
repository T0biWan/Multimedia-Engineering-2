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
videos.route('/')

    /**
     * select all videos in store and respond with status 200
     *      if there is no video object in store, respond with status 204 and the empty body
     */
    .get(function (request, respond, next) {

        if (!store.select('videos')) {

            respond.status(204).json(store.select('videos')).end();
        }

        respond.status(200).json(store.select('videos')).end();
    })

    /**
     * call method to fill required attributes of body, if they are not given in the body
     * then check if the attributes has the correct format for post operation
     *      if there are no errors insert the new object and respond with status 201 and the created object
     *      otherwise join all errors and respond with status 406
     */
    .post(function (request, respond, next) {

        request.body = fillDefaultAttributes(request.body);

        var storedErrors = validatePost(request.body, "Post");

        if (storedErrors.length <= 0) {

            var obj = fillDefaultAttributes(request.body);
            var id = store.insert('videos', obj);

            respond.status(201).json(store.select('videos', id)).end();
        }

        else {

            var errorTexts = new Error(errors.join(" & "));
            errorTexts.status = 406;
            next(errorTexts);
        }
    })


    // CRUD OPERATIONS WHICH ARE NOT ALLOWED IN THIS ROUTE

    /**
     * make error with status 405 if put operation was called in this route
     */
    .put(function (request, respond, next) {

        var error = new Error("If you want to update a vidceo you need to call the 'post' Method or add an ID");
        error.status = 405;
        next(error);
    })

    /**
     * make error with status 405 if patch operation was called in this route
     */
    .patch(function (request, respond, next) {

        var error = new Error("If you want to update a video you need to call the 'post' Method or add an ID");
        error.status = 405;
        next(error);
    })

    /**
     * make error with status 405 if delete operation was called in this route
     */
    .delete(function (request, respond, next) {

        var error = new Error("If you want to delete a video you need to add an ID to identify the desired video");
        error.status = 405;
        next(error);
    });


// CRUD Operations for ID route
videos.route('/:id')

    /**
     * call method to check if the id from the request has the correct format
     *      if not call next with error with according status
     *      else if there is no video in status with this id make error with status 404
     * select video by id from request and respond with status 200
     */
    .get(function (request, respond, next) {

        //check if id is a number
        var incorrectType = checkIfParameterIsAValidNumber(request.params.id);

        // if ID isn't a number call next with Error
        if (incorrectType) {

            next(incorrectType);
        }

        // if there is no video in the db with this id, return an error
        else if (!store.select('videos', request.params.id)) {

            var error = new Error("The ID you entered is not specified");
            error.status = 404;
            next(error);
        }

        // select video by id
        else {

            var videoSelection = store.select('videos', request.params.id);
            respond.status(200).json(videoSelection).end();
        }
    })


    .put(function (request, respond, next) {

        var incorrectType = checkIfParameterIsAValidNumber(request.params.id);

        if (incorrectType) {

            next(incorrectType);
        }

        else {

            try {
                var dummy = fillDefaultAttributes(request.body);
                store.replace('videos', request.params.id, dummy);
                res.status(200).json(store.select('videos', request.params.id)).end();

            } catch (e) {

                var error = new Error("The ID you have given is not valid.");
                error.status = 404;
                next(error);
            }
        }
    })


    /**
     * call method to check if the id from the request has the correct format
     *      if not call next with error with according status
     * If the id is correct, try to remove the object with this id
     *      if there ist no object with this id in store make error with status 404
     * remove object with id from store
     *
     */
    .delete(function (request, respond, next) {

        var error = checkIfParameterIsAValidNumber(request.params.id);

        if (error) {

            next(error);
        } else {

            try {

                store.remove('videos', request.params.id);
                respond.status(204);
            } catch (e) {

                var error = new Error("The ID you have given is not valid.");
                error.status = 404;
                next(error);
            }
        }
    })


    // CRUD OPERATIONS WHICH ARE NOT ALLOWED IN THIS ROUTE
    .post(function (request, respond, next) {

        var error = new Error("It is not allowed to create a new video ID, just a new video with the 'Post' method for videos in general.");
        error.status = 405;
        next(error);
    })

    .patch(function (req, res, next) {

        var error = new Error("Video elements can be just replaced by the 'Post' method");
        error.status = 405;
        next(error);
    });


    //auxiliary functions
    function validatePost(requestBody, crudOperation) {

        var errors = [];

        if (crudOperation === "Post") {

            // To validate a CRUD-Operation other then POST use a other function...
            // Multiple if-cases instead of if and else if cases so that every condition is tested.
            // Otherwise the user had to change one error just to get the possible next one afterwards.
            // We want al errors at once in one Array.

            // ID
            if (requestBody.id) {

                errors.push("The ID will be set automatically, please don't try to set it manually");
            }

            // Title
            if (!requestBody.title) {

                errors.push("A title is required");
            } else if (typeof requestBody.title != "string") {

                errors.push("Title has to be a String");
            }

            // Description
            if (typeof requestBody.description != "string") {

                errors.push("Description has to be a String");
            }


            // Source
            if (!requestBody.src) {

                errors.push("A source is required.");
            } else if (typeof requestBody.src != "string") {

                errors.push("Source has to be a String.");
            }

            // Length
            if (!requestBody.length) {

                errors.push("A length is required.");
            } else if (typeof requestBody.length != "number") {

                errors.push("Length has to be a number.");
            } else if (requestBody.length < 0) {

                errors.push("Length has to be positive.");
            }

            // Timestamp
            if (requestBody.timestamp) {

                errors.push("The Timestamp will be set automatically, please don't try to set it manually");
            }


            // Playcount
            if (typeof requestBody.playcount != "number") {

                errors.push("Playcount has to be a number");
            } else if (requestBody.playcount < 0) {

                errors.push("Playcount has to be positive.");
            }


            // Ranking
            if (typeof requestBody.ranking != "number") {

                errors.push("Ranking has to be a number");
            } else if (requestBody.ranking < 0) {

                errors.push("Ranking has to be positive.");
            }
        }

        return errors;
    }


    /**
     * checks if ID is a number
     * @param id
     * @returns {Error}
     */

    function checkIfParameterIsAValidNumber(id) {

        var inputID = Number(id);

        if (Number.isNaN(inputID)) {

            var error = new Error("The request just accepts digits.");
            error.status = 406;
            return error;
        } else if (inputID < 0) {

            var error = new Error("The entered digits have to be positive.");
            error.status = 400;
            return error;
        }

    }


    /**
     * set default Attributes for a new video object if they where not set in the body
     *
     * @param body
     * @returns {{title, description: (string|*), src: (string|*|string|string|string|string), length, playcount: (*|number), ranking: (*|number)}}
     */

    function fillDefaultAttributes(body) {

        //check description from req body
        if (!body.description) {

            body.description = "";
        } else {

            body.description = body.description;
        }

        //Check playcount
        if (!body.playcount) {

            body.playcount = 0;
        } else {

            body.playcount = body.playcount;
        }


        //check ranking
        if (!body.ranking) {

            body.ranking = 0;
        } else {

            body.ranking = body.ranking;
        }

        return {

            title: body.title,
            description: body.description,
            src: body.src,
            length: body.length,
            playcount: body.playcount,
            ranking: body.ranking
        }
    }


    // this middleware function can be used, if you like (or remove it)
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
