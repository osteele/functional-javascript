/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/jsshow-examples.js
 * Created: 2007-07-11
 * Modified: 2007-07-12
 */

Functional.install();

var JSShow = window.JSShow || {};

JSShow.Docs = function(options) {
    this.options = {headingLevel: 3, onLoad: Function.I};
    for (var name in options||{})
        this.options[name] = options[name];
};

JSShow.Docs.prototype.load = function(url) {
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(this.parse.bind(this), '_.responseText').reporting()});
    return this;
}

JSShow.Docs.prototype.parse = function(string) {
    this.records = (new JSShow.Docs.Parser).parse(string);
    this.options.onLoad();
    return this;
}

JSShow.Docs.prototype.replace = function(target) {
    target.innerHTML = this.toHTML();
    return this;
}

JSShow.Docs.prototype.runTests = function() {
    function toString(value) {
        if (value instanceof Array) {
            var spans = map(toString, value);
            return '[' + spans.join(', ') + ']';
        }
        switch (typeof(value)) {
        case 'function': return 'function()';
        case 'string': return '"' + value + '"';
        case 'undefined': return 'undefined';
        default: return value.toString();
        }
    }
    var tests = [];
    var failures = [];
    this.records.each(function(defn) {
        defn.tests.each(function(test) {
            tests.push(test);
            try {
                var result = eval(test.text);
            } catch (e) {
                failures.push({defn: defn, test: test, error: e});
                return;
            }
            if (test.expect != undefined && toString(result) != test.expect)
                failures.push({defn: defn, test: test, result: result});
        });
    });
    var lines = [];
    failures.each(function(failure) {
        var message = (failure.error
                       ? [failure.test.text, ' throws ', failure.error]
                       : [failure.test.text, ' -> ', toString(failure.result), ' != ', failure.test.expect]).join('');
        lines.push(failure.defn.name + ': ' + message);
    });
    return this.testResults = {
        tests: tests,
        failure: failures,
        success: !failures.length,
        toHTML: function() {
            return (failures.length
                    ? ['Failed', failures.length, 'out of', tests.length, 'tests:\n'+lines.join('\n')]
                    : ['Passed all', tests.length, 'tests.']).join(' ');
        }
    };
}

JSShow.Docs.prototype.createTestText = function() {
    var lines = [];
    this.records.each(function(defn) {
        defn.tests.length && lines.push('// ' + defn.name);
        defn.tests.each(function(test) {
            if (test.expect) {
                lines.push('console.info(' + test.text.toString() + ');');
                lines.push(['assertEquals(', test.expect, ', ', test.text, ');'].join(''));
            } else
                lines.push(test.text);
        });
        defn.tests.length && lines.push('');
    });
    return lines.join('\n').replace(/^/mg, '    ');
}

JSShow.Docs.prototype.toHTML = function(string) {
    var spans = [];
    var self = this;
    this.records.each(function(rec) {
        spans.push(rec.toHTML().replace(/(<\/?h)(\d)([\s>])/g, function(_, left, n, right) {
            return [left, n.charCodeAt(0) - 49 + self.options.headingLevel, right].join('');
        }));
    });
    return spans.join('\n');
}

JSShow.Docs.Definition = function(name, params) {
    this.target = this.params = null;
    var match;
    if (match = name.match(/(.*\.)(\w+)/)) {
        name = match[2];
        this.target = match[1];
    }
    this.name = name;
    this.params = params && params.replace(/\/\*(.*?)\*\//g, '$1').replace(/\.\.\./g, '&hellip;');
}

JSShow.Docs.Definition.prototype.setDescription = function(lines) {
    this.tests = [];
    this.blocks = [];
    this.block = null;
    map(this.addDescriptionLine, lines, this);
}

JSShow.Docs.Definition.prototype.addDescriptionLine = function(line) {
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
                    ? [input, ' <span class="output">&rarr; ', output, '</span>'].join('')
                    : text);
        pre(line);
    }
    function defn(text) {
        endParagraph();
        var line = text.replace(/\.\.\./g, '&hellip;').replace(/==/, '=<sub>def</sub>');
        blocks.push('<pre>  ' + line + '</pre>');
    }
    function indented(line) {
        endParagraph();
        pre(line.escapeHTML());
    }
    function para(line) {
        block || blocks.push(this.block = block = []);
        line = line.escapeHTML().replace(/\+([\w()_]+)\+/g, '<var>$1</var>').replace(/\*(\w+)\*/g, '<em>$1</em>');
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

JSShow.Docs.Definition.prototype.toHTML = function() {
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
        var paras = this.blocks.select(pluck('length')).map(function(block) {
            if (typeof block == 'string') return block;
            return ['<p>', block.join(' '), '</p>'].join('')
        });
        spans.push('<div class="description">');
        spans = spans.concat(paras);
        spans.push('</div>');
    }
}

JSShow.Docs.Parser = function(options) {};

JSShow.Docs.Parser.prototype.parse = function(text) {
    this.lines = [];
    this.records = [];
    this.keys = {};
    this.current = null;
    text.split('\n').each(this.processLine.bind(this));
    return this.records;
}

JSShow.Docs.Parser.prototype.processLine = function(line) {
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
        var record = self.keys[name] = new JSShow.Docs.Definition(name, params);
        record.setDescription(self.lines);
        self.records.push(record);
    }
    function processNondefinitionComment(lines) {
        var match;
        if (lines.length && (match = lines[0].match(/(\^+)\s*(.*)/))) {
            var tagName = 'h' + match[1].length;
            var html = ['<', tagName, '>', match[2], '</', tagName, '>'].join('');
            self.records.push({toHTML: Function.K(html), tests:[]});
        }
    }
}
