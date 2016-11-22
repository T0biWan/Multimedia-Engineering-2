/** Main app for server to start a small REST API for tweets
 * The included ./blackbox/store.js gives you access to a "database" which contains
 * already tweets with id 101 and 102, as well as users with id 103 and 104.
 * On each restart the db will be reset (it is only in memory).
 * Best start with GET http://localhost:3000/tweets to see the JSON for it
 * 
 * @author Johannes Konert
 * edited by Tobias Klatt, Marlon Mattern & Leon Rösler
 * @licence CC BY-SA 4.0
 *
 */
"use strict";  // tell node.js to be more "strict" in JavaScript parsing (e.g. not allow variables without var before)

// node module imports
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

// own modules imports
var store = require('./blackbox/store.js');

// creating the server application
var app = express();
var port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// logging
app.use(function(request, respond, next) {
    console.log('Request of type '+request.method + ' to URL ' + request.originalUrl);
    next();
});

// API-Version control. We use HTTP Header field Accept-Version instead of URL-part /v1/
app.use(function(request, respond, next){
    // expect the Accept-Version header to be NOT set or being 1.0
    var versionWanted = request.get('Accept-Version');
    if (versionWanted !== undefined && versionWanted !== '1.0') {
        // 406 Accept-* header cannot be fulfilled.
        respond.status(406).send('Accept-Version cannot be fulfilled').end();
    } else {
        next(); // all OK, call next handler
    }
});

// request type application/json check
app.use(function(request, respond, next) {
    if (['POST', 'PUT'].indexOf(request.method) > -1 &&
        !( /application\/json/.test(request.get('Content-Type')) )) {
        // send error code 415: unsupported media type
        respond.status(415).send('wrong Content-Type');  // user has SEND the wrong type
    } else if (!request.accepts('json')) {
        // send 406 that response will be application/json and request does not support it by now as answer
        // user has REQUESTED the wrong type
        respond.status(406).send('response of application/json only supported, please accept this');
    }
    else {
        next(); // let this request pass through as it is OK
    }
});


// Tweet routes
/*
 * this method returns all tweets
 */
app.get('/tweets', function(request,respond,next) {
    var tweets = store.select('tweets');
    for(var i=0; i<tweets.length; i++){
        appendhref(request, tweets[i], tweets[i].id, null);
    }

    var object = {};
    object = appendhref(request, object, null, null);
    object.items = tweets;
    respond.json(object);
});

/*
 * this method creates new tweets
 */
app.post('/tweets', function(request,res,next) {
    var id = store.insert('tweets', request.body);
    // set code 201 "created" and send the item back
    res.status(201).json(store.select('tweets', id));
});

/*
 * select tweets with corresponding ID
 */
app.get('/tweets/:id', function(request,respond,next) {
    var object = store.select('tweets', request.params.id);
    object = appendhref(request, object, null, null);
    respond.json(object);
});

/*
 * delete tweets by ID
 */
app.delete('/tweets/:id', function(request,respond,next) {
    store.remove('tweets', request.params.id);
    respond.status(200).end();
});

/*
 *update specific tweets
 */
app.put('/tweets/:id', function(request,respond,next) {
    store.replace('tweets', request.params.id, request.body);
    respond.status(200).end();
});

// User routes
/*
 * this method returns all users
 */
app.get('/users', function (request,respond,next) {
    respond.json(store.select('users'));
})

/*
 * this method creates new user
 */
app.post('/users', function(request,respond,next) {
    var userID = store.insert('users', request.body);
    // set code 201 "created" and send the item back
    respond.status(201).json(store.select('users', userID));
});

/*
 * select users with corresponding ID
 */
app.get('/users/:id', function(request,respond,next) {
    var user = store.select('users', request.params.id);
    var tweets = store.select('tweets');
    var userID = user.id;
    var tweetsOfUser = [];
    user = appendhref(request, user, null, null);

    for(var i=0;i<tweets.length;i++) {
        var tweetCreatorHref = tweets[i].creator.href;
        var pattern = new RegExp("\/"+userID+"$");
        if(pattern.test(tweetCreatorHref)) { // does tweetCreatorHref contain userID?
            tweetsOfUser.push(appendhref(request, tweets[i], tweets[i].id, '/tweets/'));
        }
    }

    user.tweets = {
        href : appendhref(request, user, null, null).href,
        items : tweetsOfUser
    };
    respond.json(user);
});

/*
 * delete users by ID
 */
app.delete('/users/:id', function(request,respond,next) {
    store.remove('users', request.params.id);
    respond.status(200).end();
});

/*
 * update specific user
 */
app.put('/users/:id', function(request,respond,next) {
    store.replace('users', request.params.id, request.body);
    respond.status(200).end();
});

/*
 * patch specific user
 */
app.patch("/users/:id", function(req, res){
    var user = store.select('users', req.params.id);
    if (req.body.firstname !== undefined){
        user.firstname = req.body.firstname;
    }
    if(req.body.lastname !== undefined){
        user.lastname = req.body.lastname;
    }
    store.replace('users', req.params.id, user);
    res.status(200).end();

});

// functions
/*
 * Appends a href from a request to a given object.
 * Optional a id and/or a url can be given as arguments.
 */
function appendhref(request, object, id, url){
    if(url == null) url = request.originalUrl;
    if(id == null) {
        var Url = request.protocol + '://' + request.get('host') + url;
    } else {
        var Url = request.protocol + '://' + request.get('host') + url + '/' +id;
    }
    object.href = Url;
    return object;
}

// CatchAll for the rest (unfound routes/resources) ********
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
        console.log('Internal Error: ', err.stack);
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
app.listen(port, function(err) {
    if (err !== undefined) {
        console.log('Error on startup, ',err);
    } else {
        console.log('Magic happens on port ' + port);
    }
});