/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc
 * Created: 2007-07-11
 * Modified: 2007-07-14
 */

// Options:
//   headingLevel: hn for topmost headings; default 3
//   onLoad: called when load completes
//   target: an HTML Element that is set to the docs on completion
OSDoc.Examples = function(options) {
    this.options = {headingLevel: 3, onLoad: Function.I};
    for (var name in options||{})
        this.options[name] = options[name];
};

// Load +url+ and parse its contents.
OSDoc.Examples.prototype.load = function(url) {
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(this.parse.bind(this), '_.responseText').reporting()});
    return this;
}

// Parse +text+.  If +options.target+ is specified, update it.
OSDoc.Examples.prototype.parse = function(text) {
    this.text = text = text.replace(/\s*\/\*(?:.|\n)*?\*\/[ \t]*/, '');
    this.options.target && (this.options.target.innerHTML = '<pre>' + text.escapeHTML() + '</pre>');
    window.setTimeout(function() {
        this.options.target && this.updateTarget(true);
        window.setTimeout(function() {
            this.runExamples();
            this.options.target && this.updateTarget();
            this.options.onLoad();
        }.bind(this), 10);
    }.bind(this), 10);
    return this;
}

OSDoc.Examples.prototype.updateTarget = function(fast) {
    this.options.target.innerHTML = this.toHTML(fast);
    return this;
}

OSDoc.Examples.prototype.toHTML = function(fast) {
    var self = this;
    var chunks = (unindent(this.text)
                  .escapeHTML()
                  .split('trace('));
    var outputs = this.trace || [];
    var lines = ['<pre>', chunks.shift()];
    chunks.each(function(segment, ix) {
        var output = ix < outputs.length
            ? outputs[ix].escapeHTML()
            : 'execution did not get this far';
        var m = segment.indexOf(');');
        fast || lines.push('<kbd>');
        lines.push(segment.slice(0, m));
        fast || lines.push('</kbd>');
        lines.push(';\n <samp>&rarr; ');
        lines.push(output.strip());
        lines.push('</samp>');
        fast && lines.push(segment.slice(m+2));
        fast || segment.slice(m+2).split('\n').each(function(line, ix) {
            ix && lines.push('\n');
            var hasContent = line.match(/\S/) && !line.match(/\/\//);
            hasContent && lines.push('<kbd>');
            lines.push(line);
            hasContent && lines.push('</kbd>');
        });
    });
    lines.push('</pre>');
    var html = lines.join('').replace(/((?:\/\/.*\n)+)/g, function(text) {
        if (!fast) text = text.replace(/\+(\S+)\+/g, '<code>$1</code>');
        if (!fast) text = text.replace(/\*(\S+)\*/, '<em>$1</em>');
        text = text.replace(/\/\/  (.*)/g, '<pre>$1</pre>');
        text = text.replace(/\/\//g, ' ');
        text = text.replace(/(\^+)\s*(.*)/, function(_, level, title) {
            var tagName = 'h' + (level.length - 1 + self.options.headingLevel);
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
