/** Example solution for exercise 2
    Tasks 2,3,4,5
    Multimedia Engineering 2
    WiSe 2016
 @author: Johannes Konert
 */

"use strict";

// requires *****************************************
var express = require('express');
var path = require('path'); // for task 3
var fs = require('fs'); // for task 5

// helper objects ***********************************
// Memoization object for task 5 (optional)
var fileMemoizer = (function() {
    var cache = {}; // this variable is accessible, because it is within a closure context!
    return function(filePath, callback) {
        var result = cache[filePath]; // access our closure variable (our "memory")
        if (result === undefined) {
            fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
              cache[filePath] = data;
              callback(err, data);
            });
        } else {
            callback(null, result);
        }
    }
})();

var app = express();

// routes (for tasks of exercise) ********************************

// Task 3: mounting static route as middleware before * route with app.all()
app.use('/public', express.static(path.join(__dirname, 'static')));


// Task 4: (optional)
app.get('/time', function(req, res) {
    res.header('Content-Type', 'text/plain');  // you can use .set(..) as well.
    res.send(new Date().toLocaleTimeString()); // you can use .send(...) as well.
    res.end();
});


// Task 5: (optional)
app.get('/file.txt', function(req, res) {
    var filePath = path.join(__dirname, 'dummy.json');
    var startTime = process.hrtime();
    // for task5.b. instead of directly using fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data)
    fileMemoizer(filePath, function(err, data) {
        if (err === null) {
            var stopTime = new Date();
            var timeNeeded = process.hrtime(startTime)[1]/1000000; // inspired by http://blog.tompawlak.org/measure-execution-time-nodejs-javascript
            try {
                // make sure it is valid JSON by parsing and tranforming back to String
                var dataObject = JSON.parse(data);
                data = JSON.stringify(dataObject, null, ' ');
                console.log("loaded JSON: " + dataObject.toString());

                // append time to the output data string
                data += "\n" + "Time needed for loading: " + timeNeeded + " ms";

                // send header and data to client
                // see express Response documentation
                res.type('text'); // enforces type while res.set('Content-Type', 'text/html') does not.
                res.status(200).send(data);
            }
            catch (parseError) {
                console.log(parseError);
                res.status(500).send("File content not JSON");
            }

        } else {
            // error with file
            console.log(err);
            res.status(500).send("File reading error");
        }
    });
});


// Task 2: on all HTTP request types with all routes (URLs) match this function
// This MUST be after other routes as it catches all the rest of requests...
app.all('*', function(req, res) {
    res.send('<!DOCTYPE html>' +
    '<html>' +
    '<head lang="en">' +
    '<title>Example solution for exercise 2, task 2</title>' +
    '<meta charset="UTF-8">' +
    '<meta name="author" value="Johannes Konert">' +
    '</head>' +
    '<body><h1>Hello World</h1>' +
    '</body>' +
    '</html>');
});


// finally: starting the server ******************************************
app.listen(3000, function(err) {
    console.log("Server is listening on port 3000");
});