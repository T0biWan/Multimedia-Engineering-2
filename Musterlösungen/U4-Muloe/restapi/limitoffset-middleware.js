/** This module defines a express.Router() instance
 * - supporting offset=<number> and limit=<number>*
 * - calls next with error if a impossible offset and/or limit value is given
 *
 *  Note: it expects the items to be delivered to rest under res.locals.items
 *  Note: it sets an Error-Object to next with error.status set to HTTP status code 400
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module restapi/limitoffset-middleware
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)
"use strict";

var router = require('express').Router();
var logger = require('debug')('me2u4:offsetlimit');


// the exported router with handler
router.use(function(req, res, next) {
    var offset = 0;
    var limit = Number.MAX_VALUE;
    var offsetString = req.query.offset;
    var limitString = req.query.limit;
    var err = null;
    var items =res.locals.items;

    // no items for output, then "ignore" boundary problems and silently go on
    if (!items || !Array.isArray(items)) {
        next();
        return;
    }
    // now first decouple the array from original to not manipulate original
    items = items.slice();

    if (offsetString) {
        if (!isNaN(offsetString)) {
            offset = parseInt(offsetString);
            if (offset < 0) { err = new Error('offset is negative')}
        }
        else {
            err = new Error('given offset is not a valid number '+ offsetString);
        }
    }
    if (limitString) {
        if (!isNaN(limitString)) {
            limit = parseInt(limitString);
            if (limit < 1 ) { err = new Error('limit is zero or negative')}
        }
        else {
            err = new Error('given limit is not a valid number ' + limitString);
        }
    }

    if (!err) {
        if (items.length <= offset && items.length > 0) {
            err = new Error("offset " + offset + " is equal or beyond the number of possible items " + items.length)
        } else {
            logger('using values offset, limit of ' + offset + " " + limit);
            items.splice(0, offset);
            if (limit < items.length) {
                items.length = limit;
            }
        }
    }

    if (err) {
        logger('problem occurred with limit/offset values');
        err.status = 400;
        next(err)
    } else {
        res.locals.items = items; // write it back to shared variable
        next()
    }
});

module.exports = router;