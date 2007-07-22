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

// Options:
//   headingLevel: hn for topmost headings; default 3
//   target: an HTML Element that is set to the docs on completion
//   onSuccess: called when load completes
OSDoc.Examples = function(options) {
    this.options = {headingLevel: 3,
                    staged: true,
                    onSuccess: Functional.I};
    for (var name in options||{})
        this.options[name] = options[name];
};

// Load +url+ and parse its contents.
OSDoc.Examples.prototype.load = function(url) {
    this.options.target && (this.options.target.innerHTML = OSDoc.loadingHeader);
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(this.parse.bind(this), '_.responseText').reporting()});
    return this;
}

// Parse +text+.  If +options.target+ is specified, update it.
OSDoc.Examples.prototype.parse = function(text) {
    this.text = OSDoc.stripHeader(text);
    this.updateTarget(this.options.staged && 0);
    return this;
}

OSDoc.Examples.prototype.updateTarget = function(stage) {
    if (!this.options.target) return;
    var text = this.text;
    switch (stage) {
    case 0:
        this.options.target.innerHTML = OSDoc.previewText(text);
        break;
    case 1:
        this.options.target.innerHTML = OSDoc.processingHeader + this.toHTML(true);
        break;
    case 2:
        this.runExamples();
        this.options.target.innerHTML = this.toHTML();
        this.options.onSuccess();
        return this;
    }
    this.updateTarget.bind(this).saturate(stage+1).delayed(10);
    return this;
}

OSDoc.Examples.prototype.toHTML = function(fast) {
    var self = this;
    var chunks = (OSDoc.unindent(this.text)
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
    var html = lines.join('').replace(/((?:\/\/+.*\n)+)/g, function(text) {
        if (!fast)
            text = OSDoc.inlineFormat(text);
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

OSDoc.unindent = function(text) {
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
