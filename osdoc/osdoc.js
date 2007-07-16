/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc
 * Created: 2007-07-11
 * Modified: 2007-07-14
 */

var OSDoc = window.OSDoc || {};

OSDoc.checkRequirements = function() {
    if (!window.Prototype || parseFloat(Prototype.Version) < 1.5)
        throw "OSDoc requires the Prototype JavaScript framework version >= 1.5";
    if (!window.Function)
        throw "OSDoc requires the Functional JavaScript library";
}

OSDoc.loaded = [];

// The loader logic is adapted from the Scriptaculous loader.
OSDoc.require = function(path) {
    if (OSDoc.loaded.include(path))
        return;
    document.write('<script type="text/javascript" src="' + path + '"></script>');
    console.info(path);
    OSDoc.loaded.push(path);
}

OSDoc.load = function() {
    OSDoc.checkRequirements();
    Functional.install();
    var src = map('.src', document.getElementsByTagName('script')).grep(/\bosdoc\.js/)[0];
    if (!src) return;
    var modules = Function.K([_,'examples,apidoc,doctest']).guard('!')(src.match(/\?.*load=([a-z,]*)/))[1].split(',');
    modules.include('doctest') && modules.unshift('apidoc');
    map('a -> b -> a+"osdoc."+b+".js"'.call(null, src.replace(/[^/]*$/,'')), modules).each(OSDoc.require);
}

Function.prototype.reporting = function() {
    var fn = this;
    return function() {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            window.console && console.info(e);
            throw e;
        }
    }
}

OSDoc.toString = function(value) {
    if (value instanceof Array) {
        var spans = map(OSDoc.toString, value);
        return '[' + spans.join(', ') + ']';
    }
    switch (typeof(value)) {
    case 'function': return 'function()';
    case 'string': return '"' + value + '"';
    default: return value ? value.toString() : ''+value;
    }
}

OSDoc.load();
