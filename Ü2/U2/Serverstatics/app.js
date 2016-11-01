 
var express = require('express');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname)));
app.get('/' , function(req, res) {
    res.send('<!DOCTYPE html>' + '<html lang= "en">' + '<head><meta charset="utf-8"></head' + '<body><h1>Hello world!</h1></body>' + '</html>'
             );
});

var server = app.listen(3000,function(){
    console.log('helloworld app is ready and listining at http://localhost:3000');
});