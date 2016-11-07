var express = require('express');
var app = express();
var timestamp = new Date();


app.use('/public', express.static('static'));


app.get('/time' , function(req, res) {
	res.set('Content-Type', 'text/plain');
	res.send(timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds() );
	
});
app.get('/*' , function(req, res) {

	
    res.send('<!DOCTYPE html>' + '<html lang= "en">' + '<head><meta charset="utf-8"></head>' + '<body><h1>Hello world!</h1></body>' + '</html>'
			 
             );
});

var server = app.listen(3000,function(){
    console.log('helloworld app is ready and listining at http://localhost:3000');
});
