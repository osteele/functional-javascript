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

JSShow.Doc = function() {
    this.target = this.params = null;
    this.paragraphs = [[]];
}

JSShow.Doc.prototype.addDescriptionLine = function(line) {
    var paragraphs = this.paragraphs;
    var match;
    if (match = line.match(/^>>>\s*(.*)/)) {
        line = '  ' + match[1].replace(/->(.*)/, '<span class="output">&rarr;$1</span>');
    }
    if ((match = line.match(/^==\s*(.*)/))) {
        line = '  ' + match[1].replace(/\.\.\./g, '&hellip;');
        line = line.replace(/==/, '=<sub>def</sub>');
        paragraphs.push('<pre>' + line + '</pre>');
        paragraphs.push([]);
    } else if (match = line.match(/^\s+(.*)/)) {
        var prev = paragraphs[paragraphs.length - 2];
        var match2;
        if (typeof prev == 'string' && (match2 = prev.match(/<pre>(.*)<\/pre>/)))
            return paragraphs[paragraphs.length-2] = '<pre>' + match2[1] + '\n' + line + '</pre>';
        paragraphs.push('<pre>&nbsp;&nbsp;' + match[1] + '</pre>');
        paragraphs.push([]);
    } else if (line.match(/^\s*$/))
        paragraphs.push([]);
    else {
        line = line.escapeHTML().replace(/\+([\w()_]+)\+/g, '<var>$1</var>').replace(/\*(\w+)\*/g, '<em>$1</em>');
        paragraphs[paragraphs.length-1].push(line);
    }
}

JSShow.Doc.prototype.toHTML = function() {
    var isFunction = this.params != null;
    var spans = [];
    spans.push('<div class="record">');
    spans.push('<div class="signature">');
    isFunction || spans.push('var ');
    this.target && spans.push('<span class="target">' + this.target + '</span>');
    spans.push('<span class="name">' + this.name + '</span>');
    isFunction && spans.push('(<var>' + this.params + '</var>)');
    isFunction || spans.push(';');
    spans.push('</div>');
    this.signature && spans.push('<div class="type"><span class="label">Signature:</span> '+this.signature.escapeHTML().replace(/-&gt;/g, '&rarr;').replace(/\.\.\./g, '&hellip;')+'</div>');
    var paras = this.paragraphs.select(pluck('length')).map(function(lines) {
        if (typeof lines == 'string') return lines;
        return ['<p>', lines.join(' '), '</p>'].join('')
    });
    spans.push('<div class="description">');
    spans = spans.concat(paras);
    spans.push('</div>');
    spans.push('</div>');
    return spans.join('');
}

JSShow.DocParser = function() {};

JSShow.DocParser.prototype.parse = function(text) {
    this.lines = [];
    this.records = [];
    this.keys = {};
    this.current = null;
    text.split('\n').each(this.processNextLine.bind(this));
    return this.records;
}

JSShow.DocParser.prototype.processNextLine = function(line) {
    var self = this;
    var record = this.current;
    var match;
    if (match = line.match(/^\/\/ (.*)/)) {
        this.lines.push(match[1]);
        processCommentLine(match[1]);
    } else if (this.lines.length) {
        if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*function\s*\((.*?)\)/)) {
            recordFunction(match[1], match[2]);
        } else if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*(.*?);/)) {
            var master = this.keys[match[2]];
            recordFunction(match[1], master && master.params);
        } else if ((match = line.match(/^function\s+(\w+)\s*\((.*?)\)/))) {
            recordFunction(match[1], match[2]);
        } else if ((match = line.match(/^var\s+(\w+)\s+=/))) {
            recordFunction(match[1]);
        } else {
            processNondefinitionComment(this.lines);
        }
        this.lines = [];
        this.current = null;
    }
    function processCommentLine(line) {
        var match;
        record || (record = self.current = new JSShow.Doc());
        if (match = line.match(/\s*::\s*(.*)/))
            record.signature = match[1];
        else
            record.addDescriptionLine(line);
    }
    function recordFunction(name, params) {
        var match;
        self.keys[name] = record;
        if (match = name.match(/(.*\.)(\w+)/)) {
            name = match[2];
            record.target = match[1];
        }
        record.name = name;
        record.params = params && params.replace(/\/\*/g, '').replace(/\*\//g, '');
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
