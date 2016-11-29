/** This file contains the module exports for
 * the routes of REST-API to handle requests for
 * resource type "users" (solution  for task 1.a, 1.b)
 * Supports: GET, POST, PUT, DELETE
 *
 * allows direct access to user's tweets with /:id/tweets
 * Supports: GET
 * @author Johannes Konert
 * @licence  CC BY-SA 4.0
 *
 * @error  calls next(err) with Error if a method is not supported or parameter missing or id not found
 *
 * @module routes/users
 * @type {Router}
 */
"use strict";
// Import needed modules
var express = require('express');

// own modules imports
var store = require('../blackbox/store.js');
var hrefDecorator = require('../hrefid-decorator');

// Configuration *********************************
var resourceStoreName = 'users';
var tweetResourceStoreName = 'tweets';

// Routes ****************************************
var users = express.Router();

users.route('/')
    .get(function(req, res, next) {
        res.locals.items = store.select(resourceStoreName);
        next();
    })
    .post(function(req, res, next) {
        var id = store.insert(resourceStoreName, req.body); // TODO Check that the body is really a user
        // set code 201 "created" and send the item back
        res.status(201);
        res.locals.items = store.select(resourceStoreName, id);
        next();
    });

users.route('/:id')
    .get(function(req, res, next) {
        res.locals.items = store.select(resourceStoreName, req.params.id);
        next();
    })
    .post(function(req,res, next) {
        var err = new Error('Cannot create sub-resource in users/id. Send without id');
        err.status = 405; // Method not allowed.  POST is wrong. GET would be ok.
        next(err);
    })
    .put(function(req, res, next) {
        var err = undefined;
        if (req.params.id == req.body.id) {
            store.replace(resourceStoreName, req.params.id, req.body);
            res.status(200);
            next();
        } else {
            err = new Error('cannot replace element of id '+req.params.id+' with given element.id '+req.body.id);
            err.status = 400; // bad request
            next(err);
        }
    })
    .patch(function(req, res, next) {  // Bonus task 3
        // idea: check which attributes the user object has and allow only for those a patch, ignore id patches
        // this will be idempotent; but a drawback is: it cannot add content to fields or extend the user
        var err = undefined;
        var user = store.select(resourceStoreName, req.params.id);
        if (!user) {
            err = new Error('user with id '+ req.params.id +' to PATCH not found');
            err.status = 400; // bad request
            next(err);
        } else {
            var properties = Object.getOwnPropertyNames(user);
            properties.forEach(function(prop) {
                if (req.body[prop] && prop !== 'id') {
                    user[prop] = req.body[prop];
                }
            });
            res.locals.items = user; // send the patched item back
            next();
        }
    })
    .delete(function(req, res, next) {
        store.remove(resourceStoreName, req.params.id);
        res.status(200);
        next();
    });


// *** not part of task 1.a/1.b but a nice convenience REST-API part
// *** we as well allow requests to GET /users/:id/tweets to deliver all tweets of the user

/**
 *  private helper function
 * @param {String or Number} userId - id of user to get all tweets for
 * @returns {*} undefined of nothing found or array of tweets
 */
var getUserTweets = function getUserTweets(userId) {
    var regExp = undefined;
    var allTweets = store.select(tweetResourceStoreName);
    if (!allTweets || allTweets.length == 0) {
        return undefined;
    }
    allTweets = allTweets.filter(function(element) {
        // filter by using a regular expression with e.g. "users/102"
        regExp = new RegExp('users/'+userId);
        return (element && element.creator && regExp.test(element.creator.href));
    });
    if (!allTweets || allTweets.length == 0) {
        return undefined;
    }
    return allTweets; // the found tweets
};

users.route('/:id/tweets')
    .get(function(req, res, next) {
        var tweets = getUserTweets(req.params.id);
        if (!tweets) {
            res.sendStatus(204); // 204 No Content.
        } else {
            // successfully found some tweets of the user; sending it back.
            res.json(hrefDecorator(req, '/tweets', tweets));
        }
    })
    .all(function(req, res, next) {
        var err = new Error('Only GET supported for sub-resources');
        err.status = 405; // 405 Method not allowed
        next(err);
    });
// *** end of add-on to have extra /users/:id/tweets part *******************


// Task 2.b: before adding href we add the internal tweets-attribute for each user
users.use(function(req, res, next) {
    // set the href to the users tweets. On purpose remove all GET ? params (no use of req.originalUrl)
    var setTweetHref = function(item) {
        item.tweets = {
            href: req.protocol + '://' + req.get('host') + req.baseUrl +'/'+ item.id + '/tweets'
        };

        // some extra lines for bonus tasks 4: support ?expand=tweets
        if (req.query.expand === "tweets") {
            var tweets = getUserTweets(item.id);
            var keepOldHref = item.tweets.href;
            if (tweets) {
                item.tweets = hrefDecorator(req, '/tweets', tweets);
                item.tweets.href = keepOldHref; // set back to correct value inside of /user/:id
            }
        }
    };
    var toSend = res.locals.items;
    if (toSend) {
       if (!Array.isArray(toSend)) {
           setTweetHref(toSend);
       } else {
            toSend.forEach(setTweetHref);
       }
   }
    next();
});
// Task 2.a: final handler that looks for JSON elements to send and wraps it with href-attributes
users.use(function(req, res, next){
    if (res.locals.items) {
        res.json(hrefDecorator(req, '/users', res.locals.items));
        delete res.locals.items;
    } else {
        res.sendStatus(204); // no content;
    }
});

module.exports = users;
