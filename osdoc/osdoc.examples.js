/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc.examples.js
 * Created: 2007-07-11
 * Modified: 2007-07-14
 */

OSDoc.Examples = function() {
    this.headingLevel = 3;
};

OSDoc.Examples.load = function(url) {
    var examples = new OSDoc.Examples;
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(examples.parse.bind(examples), '_.responseText').reporting()});
    return examples;
}

OSDoc.Examples.prototype.parse = function(text) {
    this.text = text.replace(/\s*\/\*(?:.|\n)*?\*\/[ \t]*/, '');
    this.runExamples();
    this.loaded = true;
    this.target && this.updateTarget();
    return this;
}

OSDoc.Examples.prototype.replace = function(target) {
    this.target = target;
    this.loaded && this.updateTarget();
    return this;
}

OSDoc.Examples.prototype.onSuccess = function(fn) {
    this.onSuccessFn = fn;
    return this;
}

OSDoc.Examples.prototype.updateTarget = function() {
    this.target.innerHTML = this.toHTML();
    this.onSuccessFn && this.onSuccessFn();
    return this;
}

OSDoc.Examples.prototype.toHTML = function() {
    var self = this;
    var chunks = (unindent(this.text)
                  .escapeHTML()
                  .split('trace('));
    var outputs = this.trace;
    var lines = ['<pre>', chunks.shift()];
    chunks.each(function(segment, ix) {
        var output = ix < outputs.length
            ? outputs[ix].escapeHTML()
            : 'execution did not get this far';
        var m = segment.indexOf(');');
        lines.push(segment.slice(0, m));
        lines.push(';\n <span class="output">&rarr; ');
        lines.push(output.strip());
        lines.push('</span>');
        lines.push(segment.slice(m+2));
    });
    lines.push('</pre>');
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
    }.bind(this)).replace(/<div class="comment">\s*<\/div>/g, '');
    return html;
}

OSDoc.Examples.prototype.runExamples = function() {
    var results = this.trace = [];
    try {
        trace = function() {
            var args = $A(arguments).map(OSDoc.toString);
            results.push(args.join(' '));
        }
        var fn = new Function('trace', this.text);
        fn(trace);
    } catch (e) {
        this.error = e;
        results.push('Error: ' + e.toString());
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
