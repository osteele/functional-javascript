/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/jsshow-examples.js
 * Created: 2007-07-11
 * Modified: 2007-07-12
 */

var JSShow = window.JSShow || {};

JSShow.Examples = function() {};

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
    var chunks = (unindent(this.text)
                  .escapeHTML()
                  .split('trace('));
    var outputs = this.trace;
    var lines = [chunks.shift()];
    chunks.each(function(segment, ix) {
        var output = (outputs[ix]||'').escapeHTML();
        var m = segment.match(/'(.*)', /);
        if (m && '"' + m[1] + '"' == output.slice(0, m[1].length+2)) {
            output = output.slice(m[1].length+2);
            segment = segment.slice(m[0].length);
        }
        m = segment.indexOf(');');
        lines.push(segment.slice(0, m));
        lines.push(';\n <span class="output">&rarr; ');
        lines.push(output.strip());
        lines.push('</span>');
        lines.push(segment.slice(m+2));
    });
    //var html = lines.join('').replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    var html = lines.join('').replace(/(\/\/.*)/g, function(line) {
        line = line.replace(/\+(\S+)\+/g, '<span class="formatted">$1</span>');
        var match;
        if (match = line.match(/\^\s*(.*)/))
            return '<h3>'+match[1]+'</h3>';
        return '<span class="comment">'+line+'</span>';
    });
    //html = html.replace(/<\/span>\s*<span class="comment">/g, '');
    return html;
}

JSShow.Examples.prototype.runExamples = function() {
    var saved = window.trace;
    var results = [];
    try {
        trace = window.trace = function() {
            function toString(value) {
                switch (typeof(value)) {
                case 'object': 
                case 'function': return 'function';
                case 'string': return '"' + value + '"';
                default: return value;
                }
            }
            var args = $A(arguments).map(toString);
            results.push(args.join(' '));
        }
        eval(this.text);
    } catch (e) {
        console.error(e);
    } finally {
        trace = saved;
    }
    this.trace = results;
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
