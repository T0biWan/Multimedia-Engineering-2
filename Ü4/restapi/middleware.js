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
        // wenn ja, (Filterrequest splittet den String in einen Array)
        var filterRequest = request.query.filter.replace(" ", "").split(",");
        // prüft ob die übergebenen  Filter in den allowed keys überhaupt enthalten sind
        filter.forEach(function (item) {
            if (allowedKeys.indexOf(item) === -1) {
                errText += item + ", ";
            }
        });
        // Wenn ein Filter nicht vorhanden war, wird ein Error Text ausgegeben
        if (errText !== "Restricted filtes: ") {
            console.log(errText);
        }
        // Der Filter wird zu weiteren Verwendung zwischengespeichert, in items.filter
        else {
            if (!respond.locals.items) res.locals.items = {};
            console.log("Filter end" && filter);
            respond.locals.items.filter = filter;
        }
    }
    next();
});

module.exports = middleware;

