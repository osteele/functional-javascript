/* Copyright 2007 by Oliver Steele.  This work is licensed under the
 * MIT license, and the Creative Commons Attribution-Noncommercial-Share
 * Alike 3.0 License. http://creativecommons.org/licenses/by-nc-sa/3.0/
 */

function Docs() {};

Docs.load = function(url) {
    var docs = new Docs();
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(docs.parse.bind(docs), '_.responseText').reporting()});
    return docs;
}

Docs.prototype.parse = function(string) {
    this.records = (new DocParser).parse(string);
    this.loaded = true;
    this.target && this.updateTarget();
}

Docs.prototype.replace = function(elt) {
    this.target = elt;
    this.loaded && this.updateTarget();
}

Docs.prototype.updateTarget = function() {
    this.target.innerHTML = this.toHTML();
    done('docs');
}

Docs.prototype.toHTML = function(string) {
    var spans = [];
    this.records.each(function(rec) {
        spans.push(rec.toHTML());
    });
    return spans.join('\n');
}

function Doc() {
    this.target = this.params = null;
    this.lines = [];
}

Doc.prototype.addDescriptionLine = function(line) {
    var match;
    if (match = line.match(/^\s+(.*)/))
        line = '<div class="formatted">&nbsp;&nbsp;' + match[1] + '</div>';
    else if (line.match(/^\s*$/))
        line = '<div class="br"> </div>';
    else
        line = line.escapeHTML().replace(/\+([\w()_]+)\+/g, '<var>$1</var>').replace(/\*(\w+)\*/g, '<em>$1</em>');
    this.lines.push(line);
}

function DocParser() {}

DocParser.prototype.parse = function(text) {
    this.records = [];
    this.current = null;
    text.split('\n').each(this.parseLine.bind(this));
    return this.records;
}

DocParser.prototype.parseLine = function(line) {
    var rec = this.current;
    var match;
    if (match = line.match(/^\/\/ (.*)/)) {
        line = match[1];
        rec || (rec = this.current = new Doc());
        if (match = line.match(/\s*::\s*(.*)/))
            rec.signature = match[1];
        else
            rec.addDescriptionLine(line);
    } else if (rec) {
        var name, params;
        if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*function\s*\((.*?)\)/)) {
            name = match[1];
            params = match[2];
        } else if ((match = line.match(/^function\s+(\w+)\s*\((.*?)\)/))) {
            name = match[1];
            params = match[2];
        } else if ((match = line.match(/^var\s+(\w+)\s+=/))) {
            name = match[1];
        } else {
            //info('no match', line);
            this.records.pop();
            this.current = null;
            return;
        }
        if (match = name.match(/(.*\.)(\w+)/)) {
            name = match[2];
            rec.target = match[1];
        }
        rec.name = name;
        rec.params = params && params.replace(/\/\*/g, '').replace(/\*\//g, '');
        this.records.push(rec);
        this.current = null;
    }
}

Doc.prototype.toHTML = function() {
    var spans = [];
    var target = '';
    this.target && spans.push('<span class="target">' + this.target + '</span>');
    spans.push('<span class="fname">' + this.name + '</span>');
    this.params != null && spans.push('(<var>' + this.params + '</var>)');
    this.signature && spans.push('<div class="signature"><span class="label">Signature:</span> '+this.signature.escapeHTML()+'</div>');
    spans = spans.concat(['<div class="description">',this.lines.join(' '), '</div>', '<br/>']);
    return spans.join('');
}
