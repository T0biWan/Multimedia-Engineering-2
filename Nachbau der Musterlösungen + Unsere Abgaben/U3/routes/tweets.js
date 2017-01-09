/**
 * Created by Tobi on 08.01.2017.
 */

"use strict";                                   // Reglementiert JS ein wenig
var express = require('express');               // Einbindung von express aus node-Modulen
var store = require('./blackbox/store.js');     // Einbindung von store aus eigenem Dateisystem
var tweets = express.Router();                  // Router für tweets

videos.route('/tweets')                                             // Handler für Tweet-Routen
    .get(function(request, respond, next) {                         // Get-Anfrage auf route '/tweets'
        respond.json(store.select('tweets'));                       // Antwort mit Inhalt aus store
    })
    .post(function(request, respond, next) {                        // Post-Anfrage auf route '/tweets'
        var id = store.insert('tweets', request.body);              // Übergebene Daten (req.body) werden in store hinterlegt, insert gibt ID zurück
        respond.status(201).json(store.select('tweets', id));       // Satuscode = 201 und hintelregtes Objekt wird aus store abgerufen
    })
    .get(function(request, respond, next) {                         // Get-Anfrage auf route '/tweets/id'
        respond.json(store.select('tweets', req.params.id));        // Passender Eintrag wird abgerufen udn zurückgesendet
    })
    .delete(function(request, respond, next) {                      // Delete-Anfrage auf route '/tweets/id', :id macht id als variable nutzbar
        store.remove('tweets', request.params.id);                  // Entsprechender Eintrag wird aus store entfernt
        respond.status(200).end();                                  // Status-Code wird auf 200 gesetzt.
    })
    .put(function(request, respond, next) {                         // Put-Anfrage auf route '/tweets/id'
        store.replace('tweets', request.params.id, request.body);   // Eintrag wird durch req.body ersetzt
        respond.status(200).end();                                  // Status-Code wird auf 200 gesetzt.
    });

module.exports = tweets;                        // Exportiere Router