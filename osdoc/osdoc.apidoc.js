/*
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc
 * Created: 2007-07-11
 * Modified: 2007-07-21
 *
 * Pre-release version; not ready for prime time.
 */

/**
 * Options:
 *   all: include undocumented elements
 *   headingLevel: hn for topmost headings; default 3
 *   staged: render incrementally if true
 *   target: an HTML Element that is set to the docs on completion
 *   onSuccess: called when load completes
 */
OSDoc.APIDoc = function(options) {
    this.options = {headingLevel: 3,
                    staged: true,
                    onSuccess: Functional.I};
    for (var name in options||{})
        this.options[name] = options[name];
};

/// Load +url+ and parse its contents.
OSDoc.APIDoc.prototype.load = function(url) {
    this.options.target && (this.options.target.innerHTML = OSDoc.loadingHeader);
    new Ajax.Request(
        url,
        {method: 'GET',
         onSuccess: Functional.compose(this.parse.bind(this), '_.responseText').reporting()});
    return this;
}

/// Parse +text+.  If +options.target+ is specified, update it.
OSDoc.APIDoc.prototype.parse = function(text) {
    this.text = OSDoc.stripHeader(text);
    this.updateTarget(this.options.staged && 0);
    return this;
}

OSDoc.APIDoc.prototype.updateTarget = function(stage) {
    if (!this.options.target) return;
    var text = this.text;
    switch (stage) {
    case 0:
        this.options.target.innerHTML = OSDoc.previewText(text);
        break;
    case 1:
        this.records = this.records || new OSDoc.APIDoc.Parser(this.options).parse(text);
        this.options.target.innerHTML = OSDoc.processingHeader + this.toHTML(true);
        break;
    default:
        this.records = this.records || (new OSDoc.APIDoc.Parser).parse(text);
        this.options.target.innerHTML = this.toHTML();
        this.options.onSuccess();
        return this;
    }
    this.updateTarget.bind(this).saturate(stage+1).delayed(10);
    return this;
}

OSDoc.APIDoc.prototype.toHTML = function(fast) {
    var spans = [];
    var self = this;
    this.records.each(function(rec) {
        spans.push(rec.toHTML(fast).replace(/(<\/?h)(\d)([\s>])/g, function(_, left, n, right) {
            return [left, n.charCodeAt(0) - 49 + self.options.headingLevel, right].join('');
        }));
    });
    return spans.join('\n');
}

OSDoc.APIDoc.Definition = function(name, params) {
    this.target = this.params = null;
    this.paramTable = {};
    var match;
    if (match = name.match(/(.*\.)(\w+)/)) {
        name = match[2];
        this.target = match[1];
    }
    this.name = name;
    if (typeof params == 'string') {
        params = params.replace(/\/\*(.*?)\*\//g, '$1');
        this.params = params.replace(/\.\.\./g, '&hellip;');
        var table = this.paramTable;
        this.params.scan(/\w+/, function(name) {
            table[name] = true;
        });
    }
    this.tests = [];
    this.blocks = [];
}

OSDoc.APIDoc.Definition.prototype.setDescription = function(lines) {
    this.block = null;
    while (lines.length && lines[lines.length-1].match(/^\s*$/))
        lines.pop();
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
                    : '<kbd>' + text.escapeHTML() + '</kbd>');
        addLine('<div class="io">'+line+'<div class="clear"> </div></div>');
    }
    function defn(text) {
        endParagraph();
        var html = OSDoc.toMathHTML(text).replace(/==/, '=<sub class="def">def</sub> ')
        blocks.push('<pre class="equivalence">' + html + '</pre>');
    }
    function indented(line) {
        endParagraph();
        pre(line.escapeHTML());
    }
    function para(line) {
        block || blocks.push(this.block = block = []);
        block.push(line);
    }
    // adders
    function endParagraph() {
        self.block = null;
    }
    function pre(line) {
        addLine('<pre>&nbsp;&nbsp;' + line + '</pre>');
    }
    function addLine(line) {
        var prev = blocks[blocks.length - 1];
        var match;
        if (typeof prev == 'string' && (match = prev.match(/<pre>(.*)<\/pre>/)))
            return blocks[blocks.length-1] = '<pre>' + match[1] + '\n&nbsp;&nbsp;' + line + '</pre>';
        blocks.push(line);
    }
}

OSDoc.APIDoc.Definition.prototype.toHTML = function(fast) {
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
        if (this.signature) {
            var text = this.signature.escapeHTML();
            if (!fast) {
                text = text.replace(/-&gt;/g, '&rarr;').replace(/\.\.\./g, '&hellip;');
                text = text.replace(/(?:(\d+)|_{(.*?)})/g, function(_, sub, sub2) {
                    return '<sub>'+(sub||sub2)+'</sub>';
                });
            }
            spans.push('<div class="type"><span class="label">Type:</span> '+text+'</div>');
        }
    }
    function description() {
        spans.push(this.getDescriptionHTML(fast));
    }
}

OSDoc.APIDoc.Definition.prototype.getDescriptionHTML = function(fast) {
    var spans = [];
    var paramTable = this.paramTable;
    var paras = this.blocks.select(pluck('length')).map(function(block) {
        // it may have already been formatted:
        if (typeof block == 'string') return block;
        var lines = ['<div>'].concat(block);
        lines.push('</div>');
        var html = lines.join(' ');
        if (!fast) html = OSDoc.inlineFormat(html, paramTable);
        return html;
    }.bind(this));
    spans.push('<div class="description">');
    spans = spans.concat(paras);
    spans.push('</div>');
    return spans.join('');
 }

OSDoc.APIDoc.Section = function(title, level, lines) {
    this.tests = [];
    this.blocks = [];
    this.paramTable = {};
    this.addDescriptionLine = OSDoc.APIDoc.Definition.prototype.addDescriptionLine;
    OSDoc.APIDoc.Definition.prototype.setDescription.call(this, lines);
    var tagName = 'h' + level;
    var html = ['<', tagName, '>', title, '</', tagName, '>'].join('');
    html += OSDoc.APIDoc.Definition.prototype.getDescriptionHTML.call(this);
    this.toHTML = Functional.K(html);
}

OSDoc.APIDoc.Parser = function(options) {
    this.options = options;
}

OSDoc.APIDoc.Parser.prototype.parse = function(text) {
    text = text.replace(/\/\*\*([\s\S]*?)\*\//g, function(_, block) {
        return block.replace(/\n(?: \* )?/g, '\n/// ');
        //return block.replace(/\n(?:[^\n]*\* )?/g, '\n/// ');
    });
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
    if (match = line.match(/^\/\/\/ (.*)/)) {
        this.lines.push(match[1]);
    } else if (this.lines.length || this.options.all) {
        if (this.lines.grep(/@nodoc/).length) {
            ;
        } else if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*function\s*\((.*?)\)/)) {
            recordDefinition(match[1], match[2] || '');
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

// re-implementation.  this replaces what's above
OSDoc.APIDoc.Parser.prototype.parse = function(text) {
    this.records = [];
    var id = '[a-zA-Z_$][a-zA-Z_$0=9]*';
    var machine = new StateMachineParser({
        tokens: {
            id: id,
        },
        states: {
        initial: [
            '///(.*)', apidocLine,
            '/\\*\\*', 'block-apidoc',
            /\/\*/, 'block-comment',
            /function (#{id})\b/, defun,
            'var\\s+(#{id})\\s+=', defvar
//             'Name...prototype = function', method,
//             'Name...prototype=', member,
//             'Name...=function', classMethod,
//             'Name...=', property
        ],
        apidocBlock: [
            '(.*?)*', [apidocLine, 'initial'],
                /.*/, apidocLine
        ],
        blockComment: [
            /\*\//, 'initial'
        ]
        }});
    machine.parse(text);
    return this.records;
    function apidocLine() {
        info('-> //', apidocLine, arguments);
    }
    function defun() {
        info('-> defun', arguments);
    }
    function defvar() {}
    function method() {}
    function member() {}
    function classMethod() {}
    function property() {}
}

// stateTable :: {String => [Rule]}, where
//   Rule is an alternating list of Regex|String, RHS
//   RHS is a Function (an action) or a String (the name of a state)
function StateMachineParser(options) {
    var tokens = options.tokens;
    var stateTables = options.states;
    this.tables = {};
    for (var key in stateTables) {
        var value = stateTables[key];
        typeof value == 'function' || (this.tables[key] = makeStateTable(value, tokens));
    }
}

StateMachineParser.prototype.parse = function(string) {
    var state = 'initial',
        pos = 0;
    while (pos < string.length) {
        gp = pos;
        if (string.charAt(pos) == '\n') {
            pos++;
            continue;
        }
        var r = this.tables[state](string, pos);
        state = r.state || state;
        pos = r.pos;
        info('set', pos, 'out of', string.length);
    }
}

function makeStateTable(rules, tokens) {
    var sources = [];
    var patterns = [];
    var actions = [];
    var targets = [];
    if (rules.length & 1)
        throw "makeStateTable requires an even number of arguments";
    for (var i = 0, j = 0; i < rules.length; ) {
        var pattern = rules[i++],
            rhs = rules[i++],
            src = pattern;
        if (src instanceof RegExp) {
            src = pattern.toSource();
            src = src.slice(1, src.lastIndexOf('/'));
        }
        src = src.replace(/#{(.+?)}/g, function(s, m) {return tokens[m] || s});
        sources[j] = src;
        patterns[j] = new RegExp(src, 'g');
        info(sources[j], patterns[j]);
        process(rhs);
        j++;
    }
    // String -> {state, position}
    return function(string, pos) {
        info('parsing', '"'+string+'"', 'at', pos);
        info('parsing', '"', string.slice(pos), '"');
        for (var i = 0, re, m; re = patterns[i]; i++) {
            re.lastIndex = pos;
            info('trying', sources[i], 'at', pos, 'on', string.slice(pos));
            if ((m = re.exec(string)) && m[0].length) {
                if (!(re.lastIndex-m[0].length == pos )) {
                    info('!=', re.lastIndex, m[0].length, pos);
                    continue;
                }
                info('success with', sources[i]);
                actions[i] && actions[i].apply(null, m);
                //info(pos, re.lastIndex, m[0].length);
                return {pos: re.lastIndex, state: targets[i]};
            }
            //info('failed', re.toSource(), string.slice(0, 80).toSource(), m);
        }
            info('failed', re, m);
            gs = [sources, patterns, actions, targets];
            gs=string;
            gp=pos;
            gres=sources[3];
            gre=patterns[3];
        throw "no match at " + string.slice(pos,pos+80).toSource();
    }
    function process(rhs) {
        switch (typeof rhs) {
        case 'function':
            if (actions[j]) throw "duplicate targets";
            actions[j] = rhs;
            break;
        case 'string':
            if (targets[j]) throw "duplicate targets";
            targets[j] = rhs;
            break;
        default:
            rhs && map(process, rhs);
        }
    }
}
