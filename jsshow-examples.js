/* Copyright 2007 by Oliver Steele.  This work is licensed under the
 * MIT license, and the Creative Commons Attribution-Noncommercial-Share
 * Alike 3.0 License. http://creativecommons.org/licenses/by-nc-sa/3.0/
 */


var JSShow = window.JSShow || {};

JSShow.Examples = function() {};

JSShow.Examples.load = function(url, exampleFunction) {
    var examples = new JSShow.Examples;
    examples.exampleFunction = exampleFunction;
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(examples.parse.bind(examples), '_.responseText').reporting()});
    return examples;
}

JSShow.Examples.prototype.parse = function(text) {
    this.text = text;
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
    var chunks = (extractLines(this.text, /function examples/, /^\}/)
                  .escapeHTML()
                  .split('trace('));
    var outputs = this.trace;
    var lines = [chunks.shift()];
    chunks.each(function(segment, ix) {
        var output = outputs[ix].escapeHTML();
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
        return '<span class="comment">'+line+'</span>';
    });
    return html;
}

JSShow.Examples.prototype.runExamples = function() {
    var examples = this.exampleFunction;
    var saved = window.trace;
    var results = [];
    try {
        trace = function() {
            var args = $A(arguments).map(function(value) {
                switch (typeof(value)) {
                case 'function': return 'function';
                case 'string': return '"' + value + '"';
                default: return value;
                }
            });
            results.push(args.join(' '));
        }
        examples();
    } catch (e) {
        console.error(e);
    } finally {
        trace = saved;
    }
    this.trace = results;
}

function unindent(lines) {
    var min = lines.grep(/\S/).map('_.match(/^\\s*/)[0].length'.lambda()).min();
    return lines.map(function(line) {
        return line.slice(min);
    });
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
