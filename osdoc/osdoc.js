/*
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc
 * Created: 2007-07-11
 * Modified: 2007-07-16
 *
 * Pre-release version; not ready for prime time.
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
    var modules = Functional.K([_,'examples,apidoc,doctest']).guard('!')(src.match(/\?.*load=([a-z,]*)/))[1].split(',');
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

OSDoc.loadingHeader = '<p class="processing">Loading...</p>';
OSDoc.processingHeader = '<p class="processing">Formatting...</p>';

// Return a string for use in the preview.
OSDoc.previewText = function(text) {
    return OSDoc.processingHeader + '<pre>' + text.escapeHTML() + '</pre>';
}

// Remove the first comment, on the assumption that it's a file header.
OSDoc.stripHeader = function(text) {
    return text.replace(/^\s*\/\*[^*](?:.|\n)*?\*\/[ \t]*/, '');
}

OSDoc.inlineFormat = function(html, variables) {
    html = html.replace(/\[(https?:.*?)\]/, '<a href="$1">$1</a>');
    html = html.replace(/\*(\w+?)\*/g, '<em>$1</em>');
    html = html.replace(/\$(.+?)\$/g, OSDoc.toMathHTML.compose('_ s -> s'));
    html = html.replace(/\`(.+?)\`/g, variables
                        ? function(_, str) {
                            if (variables[str])
                                return '<var>'+str+'</var>';
                            return '<code>'+str+'</code>';
                        }
                        : '<code>$1</code>');
    return html;
}

OSDoc.toMathHTML = function(text) {
    return '<span class="math">' + text.replace(/[a-z]/gi, function(w) {
        return '<var>'+w+'</var>';
    }).replace(/<\/var>(?:(\d+)|_\{(.*?)\})/g, function(_, sub, sub2) {
        return '</var><sub>' + (sub || sub2) + '</sub>';
    }).replace(/\.\.\./g, '&hellip;') + '</span>';
}


/*
 * Utilities
 */

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

// Array.prototype.forEach = Array.prototype.forEach || function(fn, thisObject) {
//     var len = this.length;
//     for (var i = 0 ; i < len; i++)
//         if (typeof this[i] != 'undefined')
//             fn.call(thisObject, this[i], i, this);
// }

// Array.prototype.each = Array.prototype.each || Array.prototype.forEach;

function makeEnum(words) {
    var types = {};
    words = words.split(/\s+/);
    words.each(function(word) {
        types[word] = word;
    });
    return types;
}

/*
 * Finally
 */

OSDoc.load();
