

var allowedKeys = ["id", "timestamp", "title", "src", "length", "description", "playcount", "ranking"];

var middleware = require('express').Router();

// store Errors in this String, the user gets all at once
var errText = "Restricted filters: ";

/**
 * this middleware is used for the filter query
 */
middleware.use(function (request, respond, next) {

    /**
     * the if clause checks if the incoming request is a get method and if the request contains a filter
     */

    if (request.method === "GET" && request.query.filter) {
        console.log("GET midleware FILTER");

        /**
         * when there is a filter, the string is getting splittet into an array
         */

        var filterRequest = request.query.filter.replace(" ", "").split(",");
        console.log(filterRequest);

        /**
         * iterates through all the allowedkeys and check if the filter is contained in it
         */

        filterRequest.forEach(function (item) {
            if (allowedKeys.indexOf(item) === -1) {
                errText += item + ", ";
            }
        });

        /**
         * if there is no filter present, the erorrmesage is called
         */

        if (errText !== "Restricted filters: ") {
            console.log(errText);
            var err = new Error(errText);
            errText = "Restricted filters: ";
            err.status = 400;
            next(err);
        }

        /**
         * saves the filter into local items, to use it later on
         */

        else {
            if (!respond.locals.items) respond.locals.items = {};
            console.log("Filter end" && filterRequest);
            respond.locals.items.filter = filterRequest;
        }
    }
    next();
});

/**
 *  this middleware is used for the offset querry
 */
middleware.use(function (request, respond, next) {

    /**
     * the if clause checks if the incoming request is a 'get' method and if the request contains an offset
     */
    if (request.method === "GET" && request.query.offset) {
        console.log("GET OFFSET middlware");

        /**
         * parse offset into a number
         */
        var offset = parseInt(request.query.offset);

        /**
         *checks if the offset is not a number or less than 0, then callback an error
         */
        if (isNaN(offset) || (offset < 0)) {
            var err = new Error("Offset has be a number and greater 0");
            err.status = 400;
            next(err);
        }
        else {
            if (!respond.locals.items) respond.locals.items = {};
            respond.locals.items.offset = offset;
        }
    }
    next();
});


/**
 * this middleware is used for the limit query
 */

middleware.use(function (request, respond, next) {

    /**
     * the if clause checks if the incoming request is a 'get' method and if the request contains a limit
     */
    if (request.method === "GET" && request.query.limit) {
        console.log("GET LIMIT middlware");

        /**
         *checks if the limit is not a number or less than 1, then callback an error
         */
        var limit = parseInt(request.query.limit);
        if (isNaN(limit) || (limit < 1)) {
            var err = new Error("Limit has to be a number and greater 1");
            err.status = 400;
            next(err);
            return;
        }
        else {
            if (!respond.locals.items) respond.locals.items = {};
            respond.locals.items.limit = limit;
        }
    }
    next();
});


module.exports = middleware;

