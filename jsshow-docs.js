/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/jsshow-examples.js
 * Created: 2007-07-11
 * Modified: 2007-07-12
 */

var JSShow = window.JSShow || {};

JSShow.Docs = function() {};

JSShow.Docs.load = function(url) {
    var docs = new JSShow.Docs();
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(docs.parse.bind(docs), '_.responseText').reporting()});
    return docs;
}

JSShow.Docs.prototype.parse = function(string) {
    this.records = (new JSShow.DocParser).parse(string);
    this.loaded = true;
    this.target && this.updateTarget();
    return this;
}

JSShow.Docs.prototype.replace = function(target) {
    this.target = target;
    this.loaded && this.updateTarget();
    return this;
}

JSShow.Docs.prototype.onSuccess = function(fn) {
    this.onSuccessFn = fn;
    return this;
}

JSShow.Docs.prototype.updateTarget = function() {
    this.target.innerHTML = this.toHTML();
    this.onSuccessFn && this.onSuccessFn();
    return this;
}

JSShow.Docs.prototype.toHTML = function(string) {
    var spans = [];
    this.records.each(function(rec) {
        spans.push(rec.toHTML());
    });
    return spans.join('\n');
}

JSShow.Doc = function(name, params) {
    this.target = this.params = null;
    var match;
    if (match = name.match(/(.*\.)(\w+)/)) {
        name = match[2];
        this.target = match[1];
    }
    this.name = name;
    this.params = params && params.replace(/\/\*(.*?)\*\//g, '$1').replace(/\.\.\./g, '&hellip;');
}

JSShow.Doc.prototype.setDescription = function(lines) {
    this.blocks = [];
    this.block = null;
    map(this.addDescriptionLine, lines, this);
}

JSShow.Doc.prototype.addDescriptionLine = function(line) {
    var blocks = this.blocks;
    var block = this.block;
    var match;
    if (match = line.match(/\s*::\s*(.*)/))
        return this.signature = match[1];
    if (match = line.match(/^>>\s*(.*)/)) {
        this.block = null;
        line = '  ' + match[1].escapeHTML().replace(/->(.*)/, '<span class="output">&rarr;$1</span>');
        pre(line);
        return;
    }
    if ((match = line.match(/^==\s*(.*)/))) {
        this.block = null;
        line = '  ' + match[1].replace(/\.\.\./g, '&hellip;');
        line = line.replace(/==/, '=<sub>def</sub>');
        blocks.push('<pre>' + line + '</pre>');
    } else if (match = line.match(/^\s+(.*)/)) {
        this.block = null;
        pre(match[1].escapeHTML());
    } else if (line.match(/^\s*$/))
        ;
    else {
        block || blocks.push(this.block = block = []);
        line = line.escapeHTML().replace(/\+([\w()_]+)\+/g, '<var>$1</var>').replace(/\*(\w+)\*/g, '<em>$1</em>');
        block.push(line);
    }
    function pre(line) {
        var prev = blocks[blocks.length - 1];
        var match;
        if (typeof prev == 'string' && (match = prev.match(/<pre>(.*)<\/pre>/)))
            return blocks[blocks.length-1] = '<pre>' + match[1] + '\n' + line + '</pre>';
        blocks.push('<pre>&nbsp;&nbsp;' + line + '</pre>');
    }
}

JSShow.Doc.prototype.toHTML = function() {
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
        var paras = this.blocks.select(pluck('length')).map(function(lines) {
            if (typeof lines == 'string') return lines;
            return ['<p>', lines.join(' '), '</p>'].join('')
        });
        spans.push('<div class="description">');
        spans = spans.concat(paras);
        spans.push('</div>');
    }
}

JSShow.DocParser = function() {};

JSShow.DocParser.prototype.parse = function(text) {
    this.lines = [];
    this.records = [];
    this.keys = {};
    this.current = null;
    text.split('\n').each(this.processLine.bind(this));
    return this.records;
}

JSShow.DocParser.prototype.processLine = function(line) {
    var self = this;
    var match;
    if (match = line.match(/^\/\/ (.*)/)) {
        this.lines.push(match[1]);
    } else if (this.lines.length) {
        if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*function\s*\((.*?)\)/)) {
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
        var record = self.keys[name] = new JSShow.Doc(name, params);
        record.setDescription(self.lines);
        self.records.push(record);
    }
    function processNondefinitionComment(lines) {
        var match;
        if (lines.length && (match = lines[0].match(/(\^+)\s*(.*)/))) {
            var tagName = 'h' + (match[1].length + 3);
            var html = '<' + tagName + '>' + match[2] + '</' + tagName + '>';
            self.records.push({toHTML: Function.K(html)});
        }
    }
}
