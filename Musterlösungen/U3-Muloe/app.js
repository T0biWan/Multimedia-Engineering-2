/** Main app for server to start a small REST API for tweets and users.
 * The included ./blackbox/store.js gives you access to a "database" which contains
 * already tweets with id 101 and 102, as well as users with id 103 and 104.
 * On each restart the db will be reset (it is only in memory).
 * Best start with GET http://localhost:3000/tweets to see the JSON for it
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";

// node module imports
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('debug')('u3muloe:server');

// own modules imports
var store = require('./blackbox/store.js');
var tweetsRoutes = require('./routes/tweets.js');
var usersRoutes = require('./routes/users.js');


// creating the server application
var app = express();

// Middleware ************************************
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// logging
app.use(function(req, res, next) {
    // hint: better use module morgan here.
    logger('Request of type '+req.method + ' to URL ' + req.originalUrl);
    next();
});

// API-Version control. We use HTTP Header field Accept-Version instead of URL-part /v1/
app.use(function(req, res, next){
    // expect the Accept-Version header to be NOT set or being 1.0
    var versionWanted = req.get('Accept-Version');
    if (versionWanted !== undefined && versionWanted !== '1.0') {
        // 406 Accept-* header cannot be fulfilled.
        res.status(406).send('Accept-Version cannot be fulfilled').end();
    } else {
        next(); // all OK, call next handler
    }
});

// request type application/json check
app.use(function(req, res, next) {
    if (['POST', 'PUT'].indexOf(req.method) > -1 &&
        !( /application\/json/.test(req.get('Content-Type')) )) {
        // send error code 415: unsupported media type
        res.status(415).send('wrong Content-Type');  // user has SEND the wrong type
    } else if (!req.accepts('json')) {
        // send 406 that response will be application/json and request does not support it by now as answer
        // user has REQUESTED the wrong type
        res.status(406).send('response of application/json only supported, please accept this');
    }
    else {
        next(); // let this request pass through as it is OK
    }
});


// request POST, PUT check that any content was send
app.use(function(req, res, next) {
    var err = undefined;
    if (['POST', 'PUT'].indexOf(req.method) > -1 && parseInt(req.get('Content-Length')) === 0) {
        err = new Error("content in body is missing");
        err.status = 400;
        next(err);
    } else if ('PUT' === req.method && !req.body.id) {
        err = new Error("content in body is missing field id");
        err.status = 400;
        next(err);
    }
    next();
});

// Routes ************************************************
app.use('/tweets', tweetsRoutes); // see ./routes/tweets which contains all lines that were here in CodePack before
app.use('/users', usersRoutes);

// **********************************************************
// CatchAll for the rest (not found routes/resources) ********

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers (express recognizes it by 4 parameters!)

// development error handler
// will print stacktrace as JSON response
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        logger('Internal Error: ', err.stack);
        res.status(err.status || 500);
        res.json({
            error: {
                message: err.message,
                error: err.stack
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            error: {}
        }
    });
});


// Start server ****************************
app.listen(3000, function(err) {
    if (err !== undefined) {
        console.error('Error on startup, ',err);
    }
    else {
        logger('Listening on port 3000');
    }
});