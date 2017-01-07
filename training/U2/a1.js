/**
 * Created by Tobi on 07.01.2017.
 */

"use strict";                                   // Reglementiert JS ein wenig
var express = require('express');               // Einbindung von express
var app = express();                            // To do

app.all('*', function(request, respond) {       // Passt auf jeden Request
    respond.send("Hello World");                // Antwort auf Request, könnte auch HTML sein
});

app.listen(3000, function (err) {               // Methode für Server-Start
    console.log("Magic happens on port 3000");  // Konsolenausgabe bei Serverstart
});