/** This module defines the routes for videos using the store.js as db memory
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 * edited by Tobias Klatt, Marlon Mattern & Leon Rösler
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
var middleware = require('../restapi/middleware.js');

var videos = express.Router();


// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};
var allowedKeys = ["id", "timestamp", "title", "src", "length", "description", "playcount", "ranking"];



videos.use(middleware);

// routes **********************
videos.route('/')

/**
 * select all videos in store and respond with status 200
 *      if there is no video object in store, respond with status 204 and the empty body
 */
    .get(function (request, respond, next) {

        // Überprüfung ob der FIlter übergeben wurde

        var videolist = store.select('videos');
        if (!videolist) respond.status(204).json(videolist).end();
        if (respond.locals.items) {
            var filter = respond.locals.items.filter;
            var limit = respond.locals.items.limit;
            var offset = respond.locals.items.offset;

            if (filter) {
                videolist.forEach(function (videolist) {
                    clearNotAllowed(videolist, filter);
                });
            }
            if (limit || offset) {
                limit = limit || videos.length;
                offset = offset || 0;
                if (offset >= videolist.length) {

                    var err = new Error("offset higher than database length");
                    err.status = 400;
                    next(err);
                    return;
                }
                videolist = videolist.slice(offset, limit + offset);
            }
        }
        respond.status(200).json(videolist).end();
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
            var errorTexts = new Error(storedErrors.join(" & "));
            errorTexts.status = 400;
            next(errorTexts);

        }
    })


    // CRUD OPERATIONS WHICH ARE NOT ALLOWED IN THIS ROUTE

    /**
     * make error with status 405 if put operation was called in this route
     */
    .put(function (request, respond, next) {
        var error = new Error("If you want to update a video you need to call the 'post' Method or add an ID");
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

        var videoSelection = store.select('videos', request.params.id);

        // if ID isn't a number call next with Error
        if (incorrectType) {

            next(incorrectType);
        }
        // if there is no video in the db with this id, return an error
        else if (!videoSelection) {

            var error = new Error("The ID you entered is not specified");
            error.status = 204;
            next(error);
        }
        // select video by id
        else {
            if (respond.locals.items) {
                var filter = respond.locals.items.filter;
                if (filter) {
                    clearNotAllowed(videoSelection, filter);
                }
            }
            respond.status(200).json(videoSelection).end();
        }
    })


    /**
     *  call method to check if the id from the request has the correct format
     *      if not call next with error with according status
     *  If the id is correct, try to create a new object with default attributes if attributes where not set in the body, however required
     *  try to replace video in store with same id
     *      if successful respond with status 200
     *  if there ist no object with this id in store make error with status 404
     */
    .put(function (request, respond, next) {
        var incorrectType = checkIfParameterIsAValidNumber(request.params.id);
        if (incorrectType) {
            next(incorrectType);
        }
        else {
            var dummy = fillDefaultAttributes(request.body);
            try {

                store.replace('videos', request.params.id, dummy);
                respond.status(200).json(store.select('videos', request.params.id)).end();
            } catch (e) {
                var error = new Error("The ID you entered is not specified.");
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
     */
    .delete(function (request, respond, next) {
        var incorrectType = checkIfParameterIsAValidNumber(request.params.id);
        if (incorrectType) {
            next(incorrectType);
        }
        else {
            try {
                store.remove('videos', request.params.id);
                respond.status(204);
                next();
            } catch (e) {

                e.status = 404;
                next(e);
            }
        }
    })


    // CRUD OPERATIONS WHICH ARE NOT ALLOWED IN THIS ROUTE


    /**
     * make error with status 405 if delete operation was called in this route
     */
    .post(function (request, respond, next) {
        var error = new Error("It is not allowed to create a new video ID, just a new video with the 'Post' method for videos in general.");
        error.status = 405;
        next(error);

    })

    /**
     * make error with status 405 if delete operation was called in this route
     */
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
        // Multiple if-cases instead of if and else-if cases so that every condition is tested.
        // Otherwise the user had to change one error just to get the possible next one afterwards.
        // We want al errors at once in one Array.
        errorsForAttribute(errors, requestBody.id, "id", true, false, false);
        errorsForAttribute(errors, requestBody.title, "title", false, true, false, "string");
        errorsForAttribute(errors, requestBody.description, "description", false, false, false, "string");
        errorsForAttribute(errors, requestBody.src, "src", false, true, false, "string");
        errorsForAttribute(errors, requestBody.length, "length", false, true, true, "number");
        errorsForAttribute(errors, requestBody.timestamp, "timestamp", true, false, false);
        errorsForAttribute(errors, requestBody.playcount, "playcount", false, false, true, "number");
        errorsForAttribute(errors, requestBody.ranking, "ranking", false, false, true, "number");
    }
    return errors;
}

function errorsForAttribute(array, attribute, attributName, isSetAutomatically, isRequired, requiredToBePositive, requiredDatatype) {
    // Is it possible to get the name of for example requestBody.ranking, so that we get 'ranking'?
    if (isSetAutomatically === true) if (attribute) array.push(attributName + "  will be set automatically, please don't try to set it manually");
    if (isRequired === true) if (!attribute) array.push("A " + attributeName + " is required.");
    if (requiredDatatype) if (typeof attribute != requiredDatatype) array.push(attributName + " has to be a " + requiredDatatype);
    if (requiredToBePositive === true) if (attribute < 0) array.push(attributName + " hast to be positive");
    return array;
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
        ranking: body.ranking,
        timestamp: body.timestamp
    }
}
var clearNotAllowed = function (obj, filter) {
    console.log('clearnotallowed, ');
    var allowed = filter || allowedKeys;
    console.log(allowed);
    console.log(obj);
    Object.keys(obj).forEach(function (key) {

        if (allowed.indexOf(key) === -1) delete obj[key];
    });
    return obj;
};


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
