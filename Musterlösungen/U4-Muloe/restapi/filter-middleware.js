/** This module defines a express.Router() instance
 * - supporting filter=key1,key2
 * - sends only items fields that have these names
 * - calls next with error if a filter=key is given, but key does not exist (not raised on empty item arrays!)
 *
 *  Note: it expects the items to be delivered to rest under res.locals.items
 *  Note: it sets an Error-Object to next with error.status set to HTTP status code 400
 *  Note: IF changes are made, the items are deeply cloned by JSON.parse(JSON.stringify())before
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module restapi/filter-middleware
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)
"use strict";

var router = require('express').Router();
var logger = require('debug')('me2u4:filterware');

/**
 * private helper function to filter Objects by given keys
 * @param items
 * @param keys
 * @returns {Object or Error} either the filtered items or an Error object
 */
var filterObjects = function(items, keys) {
    if (!items || !keys) {  // empty arrays evaluate to false
      return items;
    }

    var error = null;

    // helper function setting error in case key is not valid; otherwise returning the filtered object
    var filterObject = function(item) {
        var itemCopy = JSON.parse(JSON.stringify(item));
        var result = {};
        keys.forEach(function(key) {
            if (itemCopy.hasOwnProperty(key)) {
                result[key] = itemCopy[key];
            } else {
                error = new Error('given key for filter does not exist in ressource: '+ key);
            }
        });
        return error ? item: result;
    };

    if (Array.isArray(items)) {
        items.forEach(function(item, index, array) {
            array[index] = filterObject(item);
        })
    } else {
          items = filterObject(items);
    }
    return error ? error: items;
};


// the exported router with handler
router.use(function(req, res, next) {
    var filterString = req.query.filter;
    var filterKeys = [];
    var err = null;

    if (filterString !== undefined) {
        filterKeys = filterString.split(',');
        filterKeys.forEach(function(item, index, array) {
            array[index] = item.trim();
        });
        filterKeys.filter(function(item) {
            return item.length > 0;
        });
        if (filterKeys.length === 0) {
            err = new Error('given filter does not contain any keys');
            err.status = 400;
        } else {
            var result = filterObjects(res.locals.items, filterKeys);
            if (result instanceof Error) {
                err = result;
                err.status = 400;
            } else {
                res.locals.items = result;
            }
        }
    }
    if (err) {
        logger(err);
        next(err)
    } else {
        logger('Successfully filtered by ' + filterKeys.toString());
        next()
    }
});

module.exports = router;