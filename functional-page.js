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

function initialize() {
    JSShow.Examples.load('functional-examples.js').onSuccess(done.args('examples')).replace($('output'));
    JSShow.Docs.load('functional.js').onSuccess(done.args('docs')).replace($('docs'));
}

function done(name) {
    var me = arguments.callee;
    me[name] = true;
    if (me.docs && me.examples)
        $('noscript').hide();
}

Event.observe(window, 'load', initialize);
