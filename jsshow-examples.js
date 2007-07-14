/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/jsshow-examples.js
 * Created: 2007-07-11
 * Modified: 2007-07-12
 */

Functional.install();

var JSShow = window.JSShow || {};

JSShow.Examples = function() {
    this.headingLevel = 3;
};

JSShow.Examples.load = function(url) {
    var examples = new JSShow.Examples;
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(examples.parse.bind(examples), '_.responseText').reporting()});
    return examples;
}

JSShow.Examples.prototype.parse = function(text) {
    this.text = text.replace(/\s*\/\*(?:.|\n)*?\*\/[ \t]*/, '');
    this.runExamples();
    this.loaded = true;
    this.target && this.updateTarget();
    return this;
}

JSShow.Examples.prototype.replace = function(target) {
    this.target = target;
    this.loaded && this.updateTarget();
    return this;
}

JSShow.Examples.prototype.onSuccess = function(fn) {
    this.onSuccessFn = fn;
    return this;
}

JSShow.Examples.prototype.updateTarget = function() {
    this.target.innerHTML = this.toHTML();
    this.onSuccessFn && this.onSuccessFn();
    return this;
}

JSShow.Examples.prototype.toHTML = function() {
    var self = this;
    var chunks = (unindent(this.text)
                  .escapeHTML()
                  .split('trace('));
    var outputs = this.trace;
    var lines = [chunks.shift()];
    chunks.each(function(segment, ix) {
        var output = (outputs[ix]||'').escapeHTML();
        var m = segment.indexOf(');');
        lines.push(segment.slice(0, m));
        lines.push(';\n <span class="output">&rarr; ');
        lines.push(output.strip());
        lines.push('</span>');
        lines.push(segment.slice(m+2));
    });
    var html = lines.join('').replace(/((?:\/\/.*\n)+)/g, function(text) {
        text = text.replace(/\+(\S+)\+/g, '<span class="formatted">$1</span>');
        text = text.replace(/\/\/  (.*)/g, '<pre>$1</pre>');
        //text = text.replace(/\n\s*\/\//g, '');
        text = text.replace(/\/\//g, ' ');
        text = text.replace(/(\^+)\s*(.*)/, function(_, level, title) {
            var tagName = 'h' + (level.length - 1 + self.headingLevel);
            return ['</div><', tagName, '>', title, '</', tagName, '><div class="comment">'].join('');
        });
        return '<div class="comment">'+text+'</div>';
    }.bind(this));
    return html;
}

JSShow.Examples.prototype.runExamples = function() {
    var results = this.trace = [];
    try {
        trace = function() {
            function toString(value) {
                if (value instanceof Array) {
                    var spans = map(toString, value);
                    return '[' + spans.join(', ') + ']';
                }
                switch (typeof(value)) {
                case 'function': return 'function()';
                case 'string': return '"' + value + '"';
                case 'undefined': return 'undefined';
                default: return value;
                }
            }
            var args = $A(arguments).map(toString);
            results.push(args.join(' '));
        }
        var fn = new Function('trace', this.text);
        fn(trace);
    } catch (e) {
        console.error(e);
    }
}

function unindent(text) {
    var lines = text.split('\n');
    var min = lines.grep(/\S/).map('_.match(/^\\s*/)[0].length'.lambda()).min();
    return lines.map(function(line) {
        return line.slice(min);
    }).join('\n');
}

function extractLines(string, startPattern, endPattern) {
    var lines = string.split('\n');
    var start = 1 + lines.indexOf(lines.grep(startPattern)[0]);
    var segment = lines.slice(start);
    var end = start + segment.indexOf(segment.grep(endPattern)[0]);
    return unindent(lines.slice(start, end)).map(function(line) {
        return line || ' ';
    }).join('\n');
}
