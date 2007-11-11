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
    if (!window.Functional)
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
    var modules = Functional.K([_,'utils,examples,apidoc,doctest']).guard('!')(src.match(/\?.*load=([a-z,]*)/))[1].split(',');
    modules.include('doctest') && modules.unshift('apidoc');
    map('a -> b -> a+"osdoc."+b+".js"'.call(null, src.replace(/[^\/]*$/,'')), modules).each(OSDoc.require);
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

/// Return a string for use in the preview.
OSDoc.previewText = function(text) {
    return OSDoc.processingHeader + '<pre>' + text.escapeHTML() + '</pre>';
}

/// Remove the comment at the top of the file if it contains the text
/// 'copyright', because it's probably boilerplate
OSDoc.stripHeader = function(text) {
    return text.replace(/^\s*\/\*[^*](?:.|\n)*?\*\/[ \t]*/,
                        function(s) {
                            return /copyright/i(s) ? '' : s;
                        });
}

OSDoc.inlineFormat = function(html, variables) {
    return (html.replace(/\[(https?:.*?)\]/, '<a href="$1">$1</a>')
            .replace(/\*(\w+?)\*/g, '<em>$1</em>')
            .replace(/\$(.+?)\$/g, OSDoc.toMathHTML.compose('_ s -> s'))
            .replace(/\`(.+?)\`/g, variables
                     ? function(_, str) {
                         if (variables[str])
                             return '<var>'+str+'</var>';
                         return '<code>'+str+'</code>';
                     }
                     : '<code>$1</code>')
           );
}

OSDoc.toMathHTML = function(text) {
    return '<span class="math">' + text.replace(/[a-z]+/gi, function(w) {
        return '<var>'+w+'</var>';
    }).replace(/<\/var>(?:(\d+)|_\{(.*?)\})/g, function(_, sub, sub2) {
        return '</var><sub>' + (sub || sub2) + '</sub>';
    }).replace(/\.\.\./g, '&hellip;') + '</span>';
}

function makeEnum(words) {
    var types = {};
    words = words.split(/\s+/);
    words.each(function(word) {
        types[word] = word;
    });
    return types;
}


/*
 * Finally:
 */

OSDoc.loaded || OSDoc.load();
