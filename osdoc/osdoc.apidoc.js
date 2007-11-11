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
    var self = this,
        options = this.options,
        count = arguments.length,
        results = new Array(count);
    options.target && (options.target.innerHTML = OSDoc.loadingHeader);
    Array.prototype.slice.call(arguments, 0).each(function(url, ix) {
        if (options.bustCache)
            url += (/\?/(url) ? '&' : '?') + 'ts=' + new Date().getTime();
        new Ajax.Request(
            url,
            {method: 'GET',
             onSuccess: receive.reporting().bind(this, ix)});
    });
    return this;
    function receive(ix, response) {
        results[ix] = response.responseText;
        if (!--count)
            self.parse(results.join(''));
    }
}

/// Parse +text+.  If +options.target+ is specified, update it.
OSDoc.APIDoc.prototype.parse = function(text) {
    this.text = OSDoc.stripHeader(text);
    this.updateTarget(this.options.staged && 0);
    return this;
}

OSDoc.APIDoc.prototype.updateTarget = function(stage) {
    if (!this.options.target) return;

    var text = this.text,
        options = this.options,
        formatOptions = {headingLevel:options.headingLevel};
    switch (stage) {
    case 0:
        this.options.target.innerHTML = OSDoc.previewText(text);
        break;
    case 1:
        formatOptions.quicker = true;
    case 2:
        formatOptions.quick = true;
    default:
        var model = this.model = this.model || new OSDoc.APIDoc.Parser(options).parse(text),
            formatter = new HTMLFormatter(formatOptions),
            html = formatter.render(model);
        this.options.target.innerHTML = html;
        if (stage <= 2) break;
        this.options.onSuccess();
        return this;
        break;
    }
    this.updateTarget.bind(this).saturate(stage+1).delayed(10);
    return this;
}


/*
 * HTML Formatter
 */

function HTMLFormatter(options) {
    this.options = options || {};
    this.commentFormatter = new CommentFormatter(options);
}

HTMLFormatter.prototype = {
    render: function(model) {
        var writer = this.writer = new RopeWriter;
        model.definitions.each(this.definition.bind(this));
        return writer.toString();
    },

    definition: function(defn) {
        if (!this.options.all && !defn.docs.length && !defn.definitions.length) return;
        if (defn instanceof FunctionDefinition)
            this.functionDefinition(defn);
        else if (defn instanceof VariableDefinition)
            this.variableDefinition(defn);
        else if (defn instanceof Model)
            this.members(defn);
        else if (defn instanceof SectionBlock)
            this.section(defn);
        else
            throw "unknown definition";
    },

    members: function(defn) {
        defn.definitions.each(this.definition.bind(this));
    },

    functionDefinition: function(defn) {
        var writer = this.writer;
        writer.append('<div class="record"><div class="signature">');
        if (defn.container.name)
            writer.append(this.qualifiedName(defn), ' = function(');
        else
            writer.append('function ', this.qualifiedName(defn), '(');
        writer.append('<span class="params">',
                      defn.parameters.join(', ').replace(/\/\*(.*?)\*\//g, '<i>$1</i>'),
                      '</span>)\n',
                      '</div>');
        this.doc(defn);
        writer.append('</div>');
        this.members(defn);
    },

    variableDefinition: function(defn) {
        var writer = this.writer;
        writer.append('<div class="record"><div class="signature">',
                      'var ', this.qualifiedName(defn), ';',
                      '</div>');
        this.doc(defn);
        writer.append('</div>');
        this.members(defn);
    },

    section: function(defn) {
        this.commentFormatter.render(defn.docs, this.writer);
    },

    qualifiedName: function(defn) {
        var path = defn.path.slice(0, defn.path.length-1),
            name = ['<span class="name">', defn.name, '</span>'];
        return path.length
            ? ['<span name="target">', path.join('.'), '.</span>', name]
            : name;
    },

    doc: function(defn) {
        var writer = this.writer,
            formatter = this.commentFormatter,
             blocks = defn.docs;
        blocks = blocks.select(isSignature).concat(blocks.reject(isSignature));
        formatter.render(blocks, writer);
        function isSignature(block) {
            return block.type == CommentBlockTypes.signature;
        }
    }
}


/*
 * Domain Model
 */

var Model = Base.extend({
    constructor: function(name) {
        this.name = name;
        this.path = name ? [name] : [];
        this.definitions = [];
        this.docs = [];
    },

    add: function(defn) {
        var name = defn.name,
            value = this.definitions.detect(function(defn) {
                return defn.name == name;
            });
        if (defn instanceof Model && value) {
            //info(this, value.toSource(), defn);
            throw "duplicate definition in " + this + ": " + defn.name;
        };
        defn.container = this;
        defn.path = this.path.concat([defn.name]);
        this.definitions.push(defn);
    },

    findOrMake: function(name) {
        var parts = /(.+?)\.(.+)/(name);
        if (parts)
            return this.findOrMake(parts[1]).findOrMake(parts[2]);
        var value = this.definitions.detect(function(defn) {
            return defn.name == name;
        });
        if (!value) {
            value = new Model(name);
            this.add(value);
        }
        return value;
    },

    // visitors
    eachDefinition: function(fn) {
        fn(this);
        this.definitions.each(function(defn) {
            if (defn instanceof Model)
                defn.eachDefinition(fn);
        });
    }
});

var VariableDefinition = Model.extend({
    constructor: function(name, options) {
        options = options || {};
        this.base(name);
        this.docs = options.docs || [];
        this.path = null;
    },

    toString: function() {
        return ['var ', this.name].join('');
    },

    getQualifier: function() {
        return this.container && this.container.path;
    }
});

var FunctionDefinition = VariableDefinition.extend({
    constructor: function(name, params, options) {
        this.base(name, options);
        this.parameters = params.split(/,/).select(pluck('length'));
    },

    toString: function() {
        return ['function ', this.name, '()'].join('');
    },

    getQualifier: function() {
        return this.container && this.container.path;
    }
});

// A comment block that isn't associated with any particular
// language element.
function SectionBlock(docs) {
    this.docs = docs;
}


/*
 * Comments
 */

var CommentBlockTypes = makeEnum('equivalence formatted output paragraph signature heading');

function CommentParser() {
    this.reset();
}

CommentParser.rules = (function() {
    var rules = [
            /^\s*(\^+)\s*(.*)/, heading,
            /^\s*::\s*(.*)/, CommentBlockTypes.signature,
            /^>>\s*(.*)/, CommentBlockTypes.output,
            /^==\s*(.*)/, CommentBlockTypes.equivalence,
            /^\s+(.*)/, CommentBlockTypes.formatted,
            /^\s*$/, endBlock,
            /(.*)/, paragraphLine
    ];
    return rules;
    function paragraphLine(line) {
        this.createOrAdd(CommentBlockTypes.paragraph).append(line);
    }
    function endBlock() {
        this.endBlock();
    }
    function heading(level, title) {
        this.create(CommentBlockTypes.heading, {level:level.length}).append(title);
    }
})();

CommentParser.prototype = {
    parseLine: function(line) {
        var rules = CommentParser.rules;
        for (var i = 0; i < rules.length; ) {
            var item = rules[i++],
                action = rules[i++],
                match = item(line);
            if (match) {
                if (typeof action == 'function')
                    action.apply(this, match.slice(1));
                else {
                    this.createOrAdd(action).append(match[1]);
                }
                break;
            }
        }
        if (!match)
            throw "no match";
    },

    create: function(type, options) {
        var lines = [];
        var block = this.block = {type:type, lines:lines, append:lines.push.bind(lines)};
        block = $H(block).merge(options||{});
        this.blocks.push(block);
        return block;
    },

    createOrAdd: function(type) {
        var block = this.block;
        if ((block||{}).type != type) {
            var lines = [];
            this.block = block = {type:type, lines:lines, append:lines.push.bind(lines)}
            this.blocks.push(block);
        }
        return block;
    },

    endBlock: function() {
        this.block = null;
    },

    reset: function() {
        this.blocks = [];
        this.block = null;
    }
}

function CommentFormatter(options) {
    this.options = options || {};
}

Function.prototype.hoisted = function() {
    var fn = this;
    return function(lines) {
        var thisObj = this,
            args = [].slice.call(arguments, 1);
        lines.each(function(line) {
            fn.apply(thisObj, [line].concat(args));
        });
    }
}

CommentFormatter.byType = {
    equivalence: function(text, writer) {
        var html = OSDoc.toMathHTML(text).replace(/==/, '=<sub class="def">def</sub> ')
        writer.append('<pre class="equivalence">', html, '</pre>');
    }.hoisted(),

    formatted: function(line, writer) {
        writer.append('<pre>&nbsp;&nbsp;', line.escapeHTML(), '</pre>');
    }.hoisted(),

    heading: function(title, writer, block) {
        var tagName = ['h', ((this.options.headingLevel||1)-1 + block.level)];
        writer.append('<', tagName, '>', title, '</', tagName, '>');
    },

    output: function(text, writer) {
        var match = text.match(/\s*(.*)\s*->\s*(.*?)\s*$/),
            input = match ? match[1].replace(/\s+$/,'') : text,
            output = match && match[2];
        var line = (match
                    ? ['<kbd>', input.escapeHTML(), '</kbd>',
                       ' <samp>&rarr; ', output.escapeHTML(), '</samp>']
                    : '<kbd>' + text.escapeHTML() + '</kbd>');
        writer.append('<div class="io">', line,
                      '<div class="clear"></div></div>');
    }.hoisted(),

    paragraph: function(lines, writer) {
        writer.append('<p class="description">',
                      this.options.quick ? lines : OSDoc.inlineFormat(lines.join(' ')),
                      '</p>');
    },

    signature: function(lines, writer) {
        var text = (lines.join(' ').escapeHTML().
                    replace(/-&gt;/g, '&rarr;').replace(/\.\.\./g, '&hellip;').
                    replace(/(?:(\d+)|_{(.*?)})/g, function(_, sub, sub2) {
                        return '<sub>'+(sub||sub2)+'</sub>';
                    }));
        writer.append('<div class="type"><span class="label">Type:</span> ',
                      text, '</div>');
    }
}

CommentFormatter.prototype = {
    render: function(blocks, writer) {
        var self = this;
        blocks.each(function(block) {
            if (self.options.quicker)
                return writer.append(block.lines);
            isComment(block) && writer.append('<div class="description">');
            this.renderBlock(block, writer);
            isComment(block) && writer.append('</div>');
        }.bind(this));
        function isComment(block) {
            return block.type == CommentBlockTypes.signature;
        }
    },

    renderBlock: function(block, writer) {
        var fn = CommentFormatter.byType[block.type];
        if (!fn)
            throw "no formatter for " + block.type;
        fn.call(this, block.lines, writer, block);
    }
}


/*
 * Parser
 */

OSDoc.APIDoc.Parser = function(options) {
    this.options = options;
}

OSDoc.APIDoc.Parser.prototype.parse = function(text) {
    var id = '[a-zA-Z_$][a-zA-Z_$0=9]*';
    var parser = new StateMachineParser({
        tokens: {
            id: id,
        },
        states: {
            initial: [
                    /\/\/\/ ?(.*)/, docLine,
                    /\/\*\* *((?:.|\n)*?)\*\//, docBlock,
//                    /\/\*\*[ \t]*/, 'apidocBlock',
//                    /\/\*/, 'blockComment',
                    /function (#{id})\s*\((.*?)\).*/, defun,
                    /var\s+(#{id})\s*=.*/, defvar,
                        /(#{id}(?:\.#{id})*)\.(#{id})\s*=\s*function\s*\((.*?)\).*/, classMethod,
                        // /\/\/.*/, null,
                        // /\s*$/, section,
                        /\n\n/, section,
                        /.*\n/, null,
                        // solitary chars on the last line:
                        /./, null
            ],
            apidocBlock: [
                    / ?\* ?(.*?)\*\/\s*/, [docLine, 'initial'],
                    /(.*?)\*\/\s*/, [docLine, 'initial'],
                    / ?\* ?(.*)/, docLine,
                    /(.*)/, docLine
                    ///\n/, null
            ],
            blockComment: [
                    /\*\//, 'initial',
                    /\*/, null,
                    /[^\*]+/, null
                    ///\n/, null
            ]
        }});
    var globals = new Model,
        lastContainer = globals,
        docParser = new CommentParser;
    parser.parse(text);
    return globals;

    function getDocs() {
        var docs = docParser.blocks;
        docParser.reset();
        return docs;
    }
    function docBlock(s) {
        s = s.replace(/^  ?\*(?: |$)/gm, '');
        s.split('\n').each(docLine);
    }
    function docLine(s) {
        docParser.parseLine(s);
    }
    function section() {
        var docs = getDocs();
        if (docs.length)
            lastContainer.add(new SectionBlock(docs));
    }
    function defun(name, params) {
        globals.add(new FunctionDefinition(name, params, {docs: getDocs()}));
    }
    function defvar(name) {
        globals.add(new VariableDefinition(name, {docs: getDocs()}));
    }
    function classMethod(path, name, params) {
        var container = lastContainer = globals.findOrMake(path);
        container.add(new FunctionDefinition(name, params, {docs: getDocs()}));
    }
    function property(path, name) {
        var container = lastContainer = globals.findOrMake(path);
        container.add(new VariableDefinition(name, {docs: getDocs()}));
    }
}


/*
 * StateMachineParser
 */

// stateTable :: {String => [Rule]} where
//   [Rule] is an alternating list of (Regex|String, RHS)*
//   RHS is a Function (representing an action) or a String (the name of a state)
function StateMachineParser(options) {
    var tokens = options.tokens;
    var stateTables = options.states;
    this.tables = {};
    for (var key in stateTables) {
        var value = stateTables[key];
        if (typeof value != 'function')
            this.tables[key] = StateMachineParser.makeStateTable(value, tokens);
    }
}

StateMachineParser.prototype.parseLines = function(lines) {
    var state = 'initial';
    lines.each(function(line) {
    });
}

StateMachineParser.prototype.parse = function(string) {
    var start = new Date().getTime();
    var state = 'initial',
        pos = 0;
    while (pos < string.length) {
        //info('state', state, 'pos', string.slice(pos, pos+40));
        var table = this.tables[state];
        if (!table)
            throw "unknown state: " + state;
        var r = table(string, pos);
        state = r.state || state;
        if (pos == r.pos)
            throw "failure to advance";
        pos = r.pos;
    }
    //console.info('time', new Date().getTime()-start);
}

StateMachineParser.makeStateTable = function(ruleList, tokens) {
    var trace = {tries:false, matches:false, actions:false},
        debug = {doublecheck:false},
        testPrefix = true;
    var rules = [];
    if (ruleList.length & 1)
        throw "makeStateTable requires an even number of arguments";
    for (var i = 0; i < ruleList.length; ) {
        var pattern = ruleList[i++],
            rhs = ruleList[i++],
            src = pattern;
        if (src instanceof RegExp) {
            src = pattern.toSource();
            src = src.slice(1, src.lastIndexOf('/'));
        }
        src = src.replace(/#{(.+?)}/g, function(s, m) {return tokens[m] || s});
        var re = new RegExp('^'+src, 'g'),
            prefixMatch = /^([^\(\[\\\.\*])|^\\([^swdbnt])/(src);
        if (testPrefix && prefixMatch) {
            var prefixChar = prefixMatch[1] || prefixMatch[2];
            re = (function(re, src, prefixChar) {
                return function(string) {
                    var ix = re.lastIndex = arguments.callee.lastIndex,
                        match = (string.length > ix && string.charAt(ix) == prefixChar
                                 && re(string));
                    if (debug.doublecheck && !match && re(string)) {
                        var msg = "RE didn't match but string did";
                        console.error(msg, src, re, string);
                        throw msg;
                    }
                    if (match)
                        arguments.callee.lastIndex = re.lastIndex;
                    return match;
                }
            })(re, src, prefixChar);
        }
        rules.push({
            source: src,
            re: re
        });
        process(rules[rules.length-1], rhs);
    }
    // String -> {state, position}
    return function(string, pos) {
        //info('parsing', '"', string.slice(pos), '"');
        var base = 0;
        if (true) {
            var base = pos;
            string = string.slice(pos);
            pos = 0;
        }
        for (var i = 0, re, m; rule = rules[i]; i++) {
            var re = rule.re;
            trace.tries && console.info('trying', rule.source, 'at', pos, 'on', string.slice(pos, pos+40));
            re.lastIndex = pos;
            if ((m = re(string)) && m[0].length) {
                if (!(re.lastIndex-m[0].length == pos)) {
                    //info('!=', re.lastIndex, m[0].length, pos);
                    continue;
                }
                trace.matches && console.info('match', rule);
                trace.actions && rule.action && console.info(rule.action, m);
                rule.action && rule.action.apply(m[0], m.slice(1));
                return {pos: base+re.lastIndex, state: rule.target};
            }
            //info('failed', re.toSource(), string.slice(0, 80).toSource(), m);
        }
        // throw the variables into a global, so that we can debug against them
        gTrace = [rules, string, pos, string.slice(pos, pos+80)];
        throw "no match at " + string.slice(pos, pos+80).debugInspect();
    }
    function process(rule, rhs) {
        switch (typeof rhs) {
        case 'function':
            if (rule.action) throw "duplicate targets";
            rule.action = rhs;
            break;
        case 'string':
            if (rule.target) throw "duplicate targets";
            rule.target = rhs;
            break;
        default:
            rhs && rhs.each(process.bind(this, rule));
        }
    }
}
