/**
 * Created by Tobi on 08.01.2017.
 */

"use strict";                                   // Reglementiert JS ein wenig
var express = require('express');               // Einbindung von express aus node-Modulen
var tweets = require('./routes/tweets.js');     // Router für tweets
var app = express();                            // Server-Application erzeugen

app.use('/tweets', tweets);

app.listen(3000, function (err) {               // Methode für Server-Start
    console.log("Magic happens on port 3000");  // Konsolenausgabe bei Serverstart
});
