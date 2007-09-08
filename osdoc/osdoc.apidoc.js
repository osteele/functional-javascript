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
        url+'?ts='+new Date().getTime(),
        {method: 'GET',
         onSuccess: Functional.compose(this.parse.bind(this), '_.responseText').reporting()});
    return this;
}

/// Parse +text+.  If +options.target+ is specified, update it.
OSDoc.APIDoc.prototype.parse = function(text) {
    gf = this.updateTarget.bind(this, 0);
    this.text = OSDoc.stripHeader(text);
    this.updateTarget(this.options.staged && 0);
    return this;
}

OSDoc.APIDoc.prototype.updateTarget = function(stage) {
    if (!this.options.target) return;
    var model = new OSDoc.APIDoc.Parser().parse(this.text);
    info(new HTMLFormatter().render(model));

    //this.options.target.innerHTML = new HTMLFormatter().render(model);
    return;

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

OSDoc.APIDoc.Parser = function(options) {
    this.options = options;
}

function RopeWriter() {
    this.blocks = [];
}

RopeWriter.prototype = {
    append: function() {
        var blocks = this.blocks;
        for (var i = 0; i < arguments.length; i++) {
            var block = arguments[i];
            if (block instanceof Array)
                this.append.apply(this, block);
            else
                blocks.push(block);
        }
    },

    toString: function() {
        if (this.blocks.length == 1)
            return this.blocks[0];
        var value = this.blocks.join('');
        this.blocks = [value];
        return value;
    }
}

function HTMLFormatter() {}

HTMLFormatter.prototype = {
    render: function(model) {
        var writer = this.writer = new RopeWriter;
        model.definitions.each(this.definition.bind(this));
        return writer.toString();
    },

    definition: function(defn) {
        if (defn.onlyModel)
            this.namespace(defn);
        else if (defn instanceof FunctionDefinition)
            this.functionDefinition(defn);
        else if (defn instanceof VariableDefinition)
            this.variableDefinition(defn);
        else
            throw "unknown definition";
    },

    namespace: function(defn) {
        defn.definitions.each(this.definition.bind(this));
    },

    functionDefinition: function(defn) {
        var writer = this.writer;
        this.doc(defn);
        if (defn.container.name)
            writer.append(this.qualifiedName(defn), ' = function(', defn.parameters.join(', '), ')\n');
        else
            writer.append('function ', defn.name, '(', defn.parameters.join(', '), ')\n');
    },

    variableDefinition: function(defn) {
        var writer = this.writer;
        this.doc(defn);
        if (defn.container.name)
            writer.append('var ', defn.getNamespace(), '.', defn.name, ';');
        else
            writer.append('var ', defn.name, ';');
    },

    qualifiedName: function(defn) {
        return [defn.getNamespace(), '.', defn.name].join('');
    },

    doc: function(defn) {
        var writer = this.writer;
        defn.docs.each(function(block) {
            new CommentFormatter().render(block, writer);
        });
        //writer.append(OSDoc.inlineFormat(defn.docs.join('\n')), '\n');
    }
}

/*
 * Domain Model
 */

function FunctionDefinition(name, params, options) {
    options = options || {};
    this.name = name;
    this.docs = options.docs||[];
    this.parameters = params.split(/,/).select(pluck('length'));
    // FIXME
    this.define = Model.prototype.define;
    this.findOrMake = Model.prototype.findOrMake;
    this.getNamespace = function() {return this.container.getNamespace()};
    this.definitions = [];
}

FunctionDefinition.prototype = {
    toString: function() {
        return ['function ', this.name, '()'].join('');
    }
}

function VariableDefinition(name, options) {
    options = options || {};
    this.name = name;
    this.docs = options.docs||[];
    // FIXME
    this.define = Model.prototype.define;
    this.findOrMake = Model.prototype.findOrMake;
    this.getNamespace = function() {return this.container.getNamespace()};
    this.definitions = [];
}

function Model(name) {
    this.name = name;
    this.definitions = [];
    this.docs = [];
    this.onlyModel = true;
    //new OrderedDict;
}

Model.prototype = {
    define: function(defn) {
        var value = this.definitions.detect(function(defn) {
            return defn.name == name;
        });
        if (value) throw "duplicate definition";
        defn.container = this;
        this.definitions.push(defn);
    },

    findOrMake: function(name) {
        var parts = /(.+?)\.(.+)/(name);
        if (parts)
            return this.findOrMake(parts[1]).findOrMake(parts[2]);
        var value = this.definitions.detect(function(defn) {
            return defn.name == name;
        });
        if (!value)
            this.define(value = new Model(name));
        return value;
    },

    getNamespace: function() {
        var container = this.container;
        return container && container.name ? container.getNamespace() + '.' + this.name : this.name;
    }
}

/*
 * Comments
 */

var CommentBlockTypes = makeEnum('equivalence formatted output paragraph signature');

function CommentParser() {
    this.reset();
}

CommentParser.rules = (function() {
    var rules = [
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
                    this.createOrAdd(action).append(line);
                }
                break;
            }
        }
        if (!match)
            throw "no match";
    },

    createOrAdd: function(type) {
        var block = this.block;
        info('create', type, 'previous is', (block||{}).type);
        if ((block||{}).type != type) {
            var lines = [];
            this.block = block = {type:type, lines:lines, append:lines.push.bind(lines)}
            this.blocks.push(block);
        }
        return block;
    },

    endBlock: function() {
        info('clear');
        this.block = null;
    },

    reset: function() {
        this.blocks = [];
        this.block = null;
    }
}

/*
 * DocBlock Formatter
 */

function CommentFormatter() {}

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

    output: function(text, writer) {
        var match = text.match(/\s*(.*)\s*->\s*(.*?)\s*$/),
            input = match ? match[1].replace(/\s+$/,'') : text,
            output = match && match[2],
            test = (match
                    ? {text: input, expect: output}
                    : {text: input});
        writer.append(test);
        var line = (match
                    ? ['<kbd>', input.escapeHTML(), '</kbd>',
                       ' <samp>&rarr; ', output.escapeHTML(), '</samp>'].join('')
                    : '<kbd>' + text.escapeHTML() + '</kbd>');
        writer.append('<div class="io">', line, '<div class="clear"> </div></div>');
    }.hoisted(),

    paragraph: function(lines, writer) {
        writer.append('<p>', OSDoc.inlineFormat(lines.join(' ')), '</p>');
    },

    signature: function(line, writer) {
        writer.append('<pre>&nbsp;&nbsp;', line.escapeHTML(), '</pre>');
    }.hoisted()
}

CommentFormatter.prototype.render = function(block, writer) {
    var fn = CommentFormatter.byType[block.type];
    if (!fn)
        throw "no formatter for " + block.type;
    fn.call(this, block.lines, writer);
}

/*
 * Parser
 */

OSDoc.APIDoc.Parser.prototype.parse = function(text) {
    var id = '[a-zA-Z_$][a-zA-Z_$0=9]*';
    var machine = new StateMachineParser({
        tokens: {
            id: id,
        },
        states: {
            initial: [
                    /\/\/\/(.*)/, apidocLine,
                    /\/\*\*/, 'apidocBlock',
                    /\/\*/, 'block-comment',
                    /function (#{id})\s*\((.*?)\).*/, defun,
                    /var\s+(#{id})\s*=.*/, defvar,
                        /(#{id}(?:\.#{id})*)\.(#{id})\s*=\s*function\s*\((.*?)\).*/, classMethod,
                        /\/\/.*/, null
            ],
            apidocBlock: [
                    / ?\* ?(.*?)\*\/\s*/, [apidocLine, 'initial'],
                    /(.*?)\*\/\s*/, [apidocLine, 'initial'],
                    / ?\* ?(.*)/, apidocLine,
                    /(.*)/, apidocLine
            ],
            blockComment: [
                    /\*\//, 'initial'
            ]
        }});
    var model = new Model,
        docParser = new CommentParser;
    machine.parse(text);
    return model;

    function getDocs() {
        var docs = docParser.blocks;
        docParser.reset();
        return docs;
    }
    function apidocLine(s) {
        docParser.parseLine(s);
    }
    function defun(name, args) {
        model.define(new FunctionDefinition(name, args, {docs: getDocs()}));
    }
    function classMethod(namespace, name, args) {
        var container = model.findOrMake(namespace);
        container.define(new FunctionDefinition(name, args, {docs: getDocs()}));
    }
    function defvar(name) {
        model.define(new VariableDefinition(name, {docs: getDocs()}));
    }
    function property(namespace, name) {
        var container = model.findOrMake(namespace);
        container.define(new VariableDefinition(name, {docs: getDocs()}));
    }
}

/*
 * StateMachineParser
 */

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

StateMachineParser.prototype.parseLines = function(lines) {
    var state = 'initial';
    lines.each(function(line) {
    });
}

StateMachineParser.prototype.parse = function(string) {
    var state = 'initial',
        pos = 0;
    while (pos < string.length) {
        if (string.charAt(pos) == '\n') {
            pos++;
            continue;
        }
        //info('state', state, 'pos', string.slice(pos, pos+40));
        var r = this.tables[state](string, pos);
        state = r.state || state;
        pos = r.pos;
    }
}

function makeStateTable(ruleList, tokens) {
    var debugParser = false;
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
        rules.push({
            source: src,
            re: new RegExp(src, 'g')
        });
        process(rules[rules.length-1], rhs);
    }
    // String -> {state, position}
    return function(string, pos) {
        //info('parsing', '"', string.slice(pos), '"');
        for (var i = 0, re, m; rule = rules[i]; i++) {
            var re = rule.re;
            gr = rule;
            debugParser && info('trying', rule.source, 'at', pos, 'on', string.slice(pos));
            re.lastIndex = pos;
            if ((m = re(string)) && m[0].length) {
                if (!(re.lastIndex-m[0].length == pos )) {
                    //info('!=', re.lastIndex, m[0].length, pos);
                    continue;
                }
                debugParser && info('match', rule);
                rule.action && info(rule.action, m);
                rule.action && rule.action.apply(m[0], m.slice(1));
                return {pos: re.lastIndex, state: rule.target};
            }
            //info('failed', re.toSource(), string.slice(0, 80).toSource(), m);
        }
        throw "no match at " + string.slice(pos,pos+80);
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
