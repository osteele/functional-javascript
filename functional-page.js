/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional.html
 * Source: http://osteele.com/javascripts/functional-examples.js
 * Created: 2007-07-11
 * Modified: 2007-07-12
 */

var info = window.console && console.info || function(){};
var trace = info;

Function.prototype.reporting = function() {
    var fn = this;
    return function() {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            info(e);
            throw e;
        }
    }
}

// var oldRequest = Ajax.Request;
// Ajax.Request = (function() {
//     return function(url, options) {
//         info(arguments);
//         return oldRequest("functional-examples.js", arguments[1]);
//         return oldRequest.apply(Ajax, arguments);
//         if (options.onSuccess)
//             options.onSuccess = options.onSuccess.reporting();
//         return oldRequest.apply(this, url, [options].concat([].slice.call(arguments, 2)));
//     }
// })(Ajax.Request);

// debugging references
var gExamples, gDocs;

function initialize() {
    gExamples = JSShow.Examples.load('functional-examples.js').onSuccess(done.args('examples')).replace($('output'));
    gDocs = new JSShow.Docs({onLoad: function() {
        gDocs.replace($('docs'));
        gDocs.runTests();
        done('docs');
    }});
    gDocs.load('functional.js');
    Event.observe('hide-header', 'click', function() {
        Element.hide('hide-header');
        Element.show('show-header');
        Element.hide('header');
        return false;
    });
    Event.observe('show-header', 'click', function() {
        Element.hide('show-header');
        Element.show('hide-header');
        Element.show('header');
        return false;
    });
}

function done(name) {
    var me = arguments.callee;
    me[name] = true;
    if (me.docs && me.examples)
        $('noscript').hide();
}

Event.observe(window, 'load', initialize);
