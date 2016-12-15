/**
 * Created by leon on 14.12.2016.
 */

var allowedKeys = ["id", "timestamp", "title", "src", "length", "description", "playcount", "ranking"];

var middleware = require('express').Router();

// Errors werden hier gesammrelt
var errText = "Restricted filters: ";

// Inhalt der URL (use) mit der Funktion wird ermittel was in den Request gegeben wird
middleware.use(function (request, respond, next) {

    // ob der ankommende request eine get methode ist & ob der Request einen Filter hat
    if (request.method === "GET" && request.query.filter) {
        console.log("GET midleware FILTER");

        // wenn ja, (Filterrequest splittet den String in einen Array)
        var filterRequest = request.query.filter.replace(" ", "").split(",");
        console.log(filterRequest);
        // prüft ob die übergebenen  Filter in den allowed keys überhaupt enthalten sind
        filterRequest.forEach(function (item) {
            if (allowedKeys.indexOf(item) === -1) {
                errText += item + ", ";
            }
        });
        // Wenn ein Filter nicht vorhanden war, wird ein Error Text ausgegeben
        if (errText !== "Restricted filters: ") {
            console.log(errText);
            var err = new Error(errText);
            errText = "Restricted filters: ";
            err.status = 400;
            next(err);
        }
        // Der Filter wird zu weiteren Verwendung zwischengespeichert, in items.filter
        else {
            if (!respond.locals.items) respond.locals.items = {};
            console.log("Filter end" && filterRequest);
            respond.locals.items.filter = filterRequest;
        }
    }
    next();
});



//middlware für limit
middleware.use(function (request, respond, next) {

    // ob der ankommende request eine get methode ist & ob der Request einen Filter hat
    if (request.method === "GET" && request.query.limit) {
        console.log("GET midleware LIMIT");

        // wenn ja, (Filterrequest splittet den String in einen Array)
        var filterRequest = request.query.filter.replace(" ", "").split(",");
        console.log(filterRequest);
        // prüft ob die übergebenen  Filter in den allowed keys überhaupt enthalten sind
        filterRequest.forEach(function (item) {
            if (allowedKeys.indexOf(item) === -1) {
                errText += item + ", ";
            }
        });
        // Wenn ein Filter nicht vorhanden war, wird ein Error Text ausgegeben
        if (errText !== "Restricted filters: ") {
            console.log(errText);
            var err = new Error(errText);
            errText = "Restricted filters: ";
            err.status = 400;
            next(err);
        }
        // Der Filter wird zu weiteren Verwendung zwischengespeichert, in items.filter
        else {
            if (!respond.locals.items) respond.locals.items = {};
            console.log("Filter end" && filterRequest);
            respond.locals.items.filter = filterRequest;
        }
    }
    next();
});




middleware.use(function (request, respond, next) {

    // ob der ankommende request eine get methode ist & ob der Request einen Filter hat
    if (request.method === "GET" && request.query.offset) {
        console.log("GET OFFSET middlware")

        var offset = parseInt(request.query.offset);
        if(isNaN(offset) || (offset < 0)){
            var err = new Error("Offset must be a number and greater 0");
            err.status = 400;
            next(err);
        }
        else {
            // wenns noch keine items gibt, müssen wir welche anlegen
            if (!respond.locals.items) respond.locals.items = {};
            respond.locals.items.offset = offset;
        }
        }
        next();
    });


module.exports = middleware;

