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
    this.lines = [];
    this.paragraphs = [[]];
}

JSShow.Doc.prototype.addDescriptionLine = function(line) {
    var match;
    if (match = line.match(/^\s+(.*)/))
        line = '<div class="formatted">&nbsp;&nbsp;' + match[1] + '</div>';
    else if (line.match(/^\s*$/))
        line = '<div class="br"> </div>';
    else
        line = line.escapeHTML().replace(/\+([\w()_]+)\+/g, '<var>$1</var>').replace(/\*(\w+)\*/g, '<em>$1</em>');
    this.lines.push(line);
}

JSShow.Doc.prototype.addDescriptionLine = function(line) {
    var paragraphs = this.paragraphs;
    var match;
    if (match = line.match(/^\s+(.*)/)) {
        paragraphs.push('<div class="formatted">&nbsp;&nbsp;' + match[1] + '</div>');
        paragraphs.push([]);
    } else if (line.match(/^\s*$/))
        paragraphs.push([]);
    else {
        line = line.escapeHTML().replace(/\+([\w()_]+)\+/g, '<var>$1</var>').replace(/\*(\w+)\*/g, '<em>$1</em>');
        paragraphs[paragraphs.length-1].push(line);
    }
}

JSShow.DocParser = function() {};

JSShow.DocParser.prototype.parse = function(text) {
    this.records = [];
    this.current = null;
    text.split('\n').each(this.processNextLine.bind(this));
    return this.records;
}

JSShow.DocParser.prototype.processNextLine = function(line) {
    var self = this;
    var record = this.current;
    var match;
    if (match = line.match(/^\/\/ (.*)/)) {
        processCommentLine(match[1]);
    } else if (record) {
        if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*function\s*\((.*?)\)/)) {
            recordFunction(match[1], match[2]);
        } else if ((match = line.match(/^function\s+(\w+)\s*\((.*?)\)/))) {
            recordFunction(match[1], match[2]);
        } else if ((match = line.match(/^var\s+(\w+)\s+=/))) {
            recordFunction(match[1]);
        } else {
            //info('no match', line);
            this.current = null;
        }
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
        if (match = name.match(/(.*\.)(\w+)/)) {
            name = match[2];
            record.target = match[1];
        }
        record.name = name;
        record.params = params && params.replace(/\/\*/g, '').replace(/\*\//g, '');
        self.records.push(record);
        self.current = null;
    }
}

JSShow.Doc.prototype.toHTML = function() {
    var spans = [];
    spans.push('<div class="record">');
    spans.push('<div class="signature">');
    this.target && spans.push('<span class="target">' + this.target + '</span>');
    spans.push('<span class="name">' + this.name + '</span>');
    this.params != null && spans.push('(<var>' + this.params + '</var>)');
    spans.push('</div>');
    this.signature && spans.push('<div class="type"><span class="label">Signature:</span> '+this.signature.escapeHTML()+'</div>');
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
