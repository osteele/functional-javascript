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
OSDoc.APIDoc = function(options) {
    this.options = {headingLevel: 3, onLoad: Function.I};
    for (var name in options||{})
        this.options[name] = options[name];
};

// Load +url+ and parse its contents.
OSDoc.APIDoc.prototype.load = function(url) {
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(this.parse.bind(this), '_.responseText').reporting()});
    return this;
}

// Parse +text+.  If +options.target+ is specified, update it.
OSDoc.APIDoc.prototype.parse = function(text) {
    this.options.target && (this.options.target.innerHTML = '<pre>' + text.replace(/\s*\/\*(?:.|\n)*?\*\/[ \t]*/, '').escapeHTML() + '</pre>');
    window.setTimeout(function() {
        this.records = (new OSDoc.APIDoc.Parser).parse(text);
        this.options.target && this.updateTarget();
        this.options.onLoad();
    }.bind(this), 10);
    return this;
}

OSDoc.APIDoc.prototype.updateTarget = function() {
    this.options.target.innerHTML = this.toHTML();
    return this;
}

OSDoc.APIDoc.prototype.toHTML = function(string) {
    var spans = [];
    var self = this;
    this.records.each(function(rec) {
        spans.push(rec.toHTML().replace(/(<\/?h)(\d)([\s>])/g, function(_, left, n, right) {
            return [left, n.charCodeAt(0) - 49 + self.options.headingLevel, right].join('');
        }));
    });
    return spans.join('\n');
}

OSDoc.APIDoc.Definition = function(name, params) {
    this.target = this.params = null;
    var match;
    if (match = name.match(/(.*\.)(\w+)/)) {
        name = match[2];
        this.target = match[1];
    }
    this.name = name;
    this.params = params && params.replace(/\/\*(.*?)\*\//g, '$1').replace(/\.\.\./g, '&hellip;');
    this.tests = [];
    this.blocks = [];
}

OSDoc.APIDoc.Definition.prototype.setDescription = function(lines) {
    this.block = null;
    map(this.addDescriptionLine, lines, this);
}

OSDoc.APIDoc.Definition.prototype.addDescriptionLine = function(line) {
    var blocks = this.blocks;
    var block = this.block;
    var self = this;
    var rules =
        [[/\s*::\s*(.*)/, type],
         [/^>>\s*(.*)/, output],
         [/^==\s*(.*)/, defn],
         [/^\s+(.*)/, indented],
         [/^\s*$/, endParagraph],
         [/(.*)/, para]];
    for (var i = 0; i < rules.length; i++) {
        var item = rules[i];
        var match;
        if (match = line.match(item[0])) {
            item[1].apply(this, [].slice.call(match, 1));
            break;
        }
    }
    
    // line type handlers (some also add)
    function type(text) {
        this.signature = text;
    }
    function output(text) {
        endParagraph();
        var match = text.match(/\s*(.*)\s*->\s*(.*?)\s*$/);
        var input = match ? match[1].replace(/\s+$/,'') : text;
        var output = match && match[2];
        var test = (match
                    ? {text: input, expect: output}
                    : {text: input});
        self.tests.push(test);
        var line = (match
                    ? ['<kbd>', input.escapeHTML(), '</kbd>',
                       ' <samp>&rarr; ', output.escapeHTML(), '</samp>'].join('')
                    : '<kbd>' + text.escapeHTML()) + '</kbd>';
        pre(line);
    }
    function defn(text) {
        endParagraph();
        var line = text.replace(/\.\.\./g, '&hellip;').replace(/==/, '=<sub>def</sub>');
        blocks.push('<pre class="equivalence">  ' + line + '</pre>');
    }
    function indented(line) {
        endParagraph();
        pre(line.escapeHTML());
    }
    function para(line) {
        block || blocks.push(this.block = block = []);
        line = line.escapeHTML().replace(/\+(\S+)\+/g, '<var>$1</var>').replace(/\*(\w+)\*/g, '<em>$1</em>');
        block.push(line);
    }
    // adders
    function endParagraph() {
        self.block = null;
    }
    function pre(line) {
        var prev = blocks[blocks.length - 1];
        var match;
        if (typeof prev == 'string' && (match = prev.match(/<pre>(.*)<\/pre>/)))
            return blocks[blocks.length-1] = '<pre>' + match[1] + '\n&nbsp;&nbsp;' + line + '</pre>';
        blocks.push('<pre>&nbsp;&nbsp;' + line + '</pre>');
    }
}

OSDoc.APIDoc.Definition.prototype.toHTML = function() {
    var isFunction = this.params != null;
    var spans = [];
    
    spans.push('<div class="record">');
    signature.call(this);
    type.call(this);
    description.call(this);
    spans.push('</div>');
    return spans.join('');
    
    function signature() {
        spans.push('<div class="signature">');
        isFunction || spans.push('var ');
        this.target && spans.push('<span class="target">' + this.target + '</span>');
        spans.push('<span class="name">' + this.name + '</span>');
        isFunction
            ? spans.push('(<var>' + this.params + '</var>)')
            : spans.push(';');
        spans.push('</div>');
    }
    function type() {
        this.signature && spans.push('<div class="type"><span class="label">Type:</span> '+this.signature.escapeHTML().replace(/-&gt;/g, '&rarr;').replace(/\.\.\./g, '&hellip;')+'</div>');
    }
    function description() {
        spans.push(this.getDescriptionHTML());
    }
}

OSDoc.APIDoc.Definition.prototype.getDescriptionHTML = function() {
    var spans = [];
    var paras = this.blocks.select(pluck('length')).map(function(block) {
        // it may have already been formatted:
        if (typeof block == 'string') return block;
        return html = ['<p>', block.join(' ').replace(
                /\bhttp:\S*/, function(url) {
                    var punct = '', match = url.match(/(.*)([\.,!])$/);
                    if (match) {
                        url = match[1];
                        punct = match[2];
                    }
                    return ['<a href="', url, '">', url, '</a>', punct].join('');
                }), '</p>'].join('');
    });
    spans.push('<div class="description">');
    spans = spans.concat(paras);
    spans.push('</div>');
    return spans.join('');
 }

OSDoc.APIDoc.Section = function(title, level, lines) {
    this.tests = [];
    this.blocks = [];
    this.addDescriptionLine = OSDoc.APIDoc.Definition.prototype.addDescriptionLine;
    OSDoc.APIDoc.Definition.prototype.setDescription.call(this, lines);
    var tagName = 'h' + level;
    var html = ['<', tagName, '>', title, '</', tagName, '>'].join('');
    html += OSDoc.APIDoc.Definition.prototype.getDescriptionHTML.call(this);
    this.toHTML = Function.K(html);
}

OSDoc.APIDoc.Parser = function(options) {};

OSDoc.APIDoc.Parser.prototype.parse = function(text) {
    this.lines = [];
    this.records = [];
    this.keys = {};
    this.current = null;
    text.split('\n').each(this.processLine.bind(this));
    return this.records;
}

OSDoc.APIDoc.Parser.prototype.processLine = function(line) {
    var self = this;
    var match;
    if (match = line.match(/^\/\/ (.*)/)) {
        this.lines.push(match[1]);
    } else if (this.lines.length) {
        if (this.lines.grep(/@nodoc/).length) {
            ;
        } else if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*function\s*\((.*?)\)/)) {
            recordDefinition(match[1], match[2]);
        } else if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*(.*?);/)) {
            var master = this.keys[match[2]];
            recordDefinition(match[1], master && master.params);
        } else if ((match = line.match(/^function\s+(\w+)\s*\((.*?)\)/))) {
            recordDefinition(match[1], match[2]);
        } else if ((match = line.match(/^var\s+(\w+)\s+=/))) {
            recordDefinition(match[1]);
        } else {
            processNondefinitionComment(this.lines);
        }
        this.lines = [];
    }
    function recordDefinition(name, params) {
        var record = self.keys[name] = new OSDoc.APIDoc.Definition(name, params);
        record.setDescription(self.lines);
        self.records.push(record);
    }
    function processNondefinitionComment(lines) {
        var match;
        if (lines.length && (match = lines[0].match(/(\^+)\s*(.*)/))) {
            var title = match[2];
            var level = match[1].length;
            var record = new OSDoc.APIDoc.Section(title, level, lines.slice(1));
            self.records.push(record);
        }
    }
}
