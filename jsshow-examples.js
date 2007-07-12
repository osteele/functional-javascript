/* Copyright 2007 by Oliver Steele.  This work is licensed under the
 * MIT license, and the Creative Commons Attribution-Noncommercial-Share
 * Alike 3.0 License. http://creativecommons.org/licenses/by-nc-sa/3.0/
 */

Event.observe(window, 'load', initialize);

function initialize() {
    Functional.install();
    new Ajax.Request(
        $('output').innerHTML,
        {method: 'GET', onSuccess: 'displayExamples(_.responseText)'.lambda()});
}

function unindent(lines) {
    var min = lines.grep(/\S/).map(function(line) {
        return line.match(/^\s*/)[0].length; 
    }).min();
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

function runExamples(examples) {
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
    return results;
}

function displayExamples(string) {
    var chunks = (extractLines(string, /function examples/, /^\}/)
                  .escapeHTML()
                  .split('trace('));
    var outputs = runExamples(examples);
    var lines = [chunks.shift()];
    chunks.each(function(segment, ix) {
        var output = outputs[ix].escapeHTML();
        var m = segment.match(/'(.*)', /);
        if (m && '"' + m[1] + '"' == output.slice(0, m[1].length+2)) {
            output = output.slice(m[1].length+2);
            segment = segment.slice(m[0].length);
        }
        var m = segment.indexOf(');');
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
    $('output').innerHTML = html;
    done('examples');
}
