/** This module provides a function that decorates given objects with a href attribute based on their id.
 *  Needs as parameter the request object, resource-prefix of URL and the element(s) to manipulate
 *
 *  @author Johannes Konert
 * @licence  CC BY-SA 4.0
 *
 *
 * @module routes/users
 * @type {Router}
 */
"use strict";

var logger = require('debug')('u3muloe:hrefdecorator');
/** private helper function to set the href attribute
 *
 * @param {object} item - the item that has an id attribute where href is set to
 * @param  {string] urlPrefix - the prefix to use
 */
var addHref= function(urlPrefix, item) {
    if (!item) {
        logger('given element is not valid');
    } else if (!item.id) {
        logger("given element for HttpIdDecorator has no id attribute, ", item);
    }
    else {
        item.href = urlPrefix + item.id;
    }
};

/** Decorates given objects with a href attribute based on their id. It does not copy the elements. Original elements
 * are directly manipulated.
 *
 *  @param {HttpRequest} req - request object
 *  @param {String} prefix - resource prefix in URL
 *  @param {object or array} elements - one or many objects with id attribute where to add href attribute
 *  @return {object} element given is returned; in case of an array it is automatically wrapped with an object {id: , items:}
 */
module.exports = function HrefIdDecorator(req, prefix, elements) {
    var apiURL = req.protocol + '://' + req.get('host') + prefix + '/';
    var result = undefined;
    if (!Array.isArray(elements)) {
        addHref(apiURL, elements);
        result = elements;
    }
    else {
        elements.forEach(function(item) {
            // This Design Pattern is called "Function Currying": Number of Parameters is reduced by a wrapping function
            addHref(apiURL, item)
        });
        result = {
            href: req.protocol + '://' + req.get('host') + req.originalUrl,
            items: elements
        }
    }
    return result;
};