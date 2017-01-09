/**
 * Created by Tobi on 07.01.2017.
 */

"use strict";                                   // Reglementiert JS ein wenig
var express = require('express');               // Einbindung von express
var app = express();                            // To do

app.get('/number', function(request, respond) { // Anfrage auf pfad 'number' wird entgegenommen
    respond.set('Content-Type', 'text/plain');  // Content-Type wird auf text/plain gesetzt
    respond.send('33');                         // Eine total tolle response wird gesendet, als text/plain
});

app.listen(3000, function (err) {               // Methode für Server-Start
    console.log("Magic happens on port 3000");  // Konsolenausgabe bei Serverstart
});
