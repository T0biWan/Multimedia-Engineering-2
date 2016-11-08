/**
* Hello World Main app
*
*
* @author #div
* @license ISC
*/

var express = require('express');
var app = express();
var timestamp = new Date();
var fileSystem = require('fs');

app.use('/public', express.static('static'));

app.get('/time' , function(req, res) {
	res.set('Content-Type', 'text/plain');
	res.send(timestamp.getHours() + ':' + timestamp.getMinutes() + ':' + timestamp.getSeconds());	
});

app.get('/file.txt', function(req, res){
    var time = process.hrtime()[1];
    fileSystem.readFile('file.txt', function (err, text) {
        if (err) return console.log(err);
        res.set('Content-Type', 'text/plain');
        res.write(text + '\n' + (process.hrtime()[1]-time) + ' Nanoseconds');
        //res.send(text);
        res.end();
    });
});

app.get('/*' , function(req, res) {
    res.send('<!DOCTYPE html>' + 
             '<html lang= "en">' + 
                '<head> <meta charset="utf-8"> </head>' + 
                '<body> <h1>Hello world!</h1> </body>' + 
             '</html>'
    );
});

var server = app.listen(3000,function(){
    console.log('helloworld app is ready and listining at http://localhost:3000');
});