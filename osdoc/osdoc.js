/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc
 * Created: 2007-07-11
 * Modified: 2007-07-16
 */

var OSDoc = window.OSDoc || {};

// Loading and initialization
// The loader logic is adapted from the Scriptaculous loader.

OSDoc.checkRequirements = function() {
    if (!window.Prototype || parseFloat(Prototype.Version) < 1.5)
        throw "OSDoc requires the Prototype JavaScript framework version >= 1.5";
    if (!window.Function)
        throw "OSDoc requires the Functional JavaScript library";
}

OSDoc.loadedModules = [];

OSDoc.require = function(path) {
    if (OSDoc.loadedModules.include(path))
        return;
    document.write('<script type="text/javascript" src="' + path + '"></script>');
    OSDoc.loadedModules.push(path);
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

OSDoc.previewHeader = '<p>Processing...</p>';

// Return a string for use in the preview.
OSDoc.previewText = function(text) {
    return OSDoc.previewHeader + '<pre>' + text.escapeHTML() + '</pre>';
}

// Remove the first comment, on the assumption that it's a file header.
OSDoc.stripHeader = function(text) {
    return text.replace(/\s*\/\*(?:.|\n)*?\*\/[ \t]*/, '');
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

Function.prototype.delayed = function(ms) {
    window.setTimeout(this.reporting(), ms);
}

OSDoc.load();
