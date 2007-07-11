/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  License: MIT License (Open Source)
  Homepage: http://osteele.com/sources/javascript
  Download: http://osteele.com/sources/javascript/divstyle.js
  Docs: http://osteele.com/sources/javascript/docs/divstyle
  Example: http://osteele.com/sources/javascript/demos/gradients.html
  Blog: http://osteele.com/archives/2006/03/javascript-gradient-roundrects
  Created: 2006-03-16
  Modified: 2006-03-21
  
  +divstyle.js+ adds a user-extensible style mechanism, that parallels
  CSS styles but can contain properties that are not in the CSS
  standard.
  
  When +divstyle.js+ is loaded, <tt><div></tt> tags in the HTML
  document that have a class of "+style+" can contain (a subset of)
  CSS, but with nonstandard property names.  Each element that is
  selected by a "div CSS" rule has a +.divStyle+ property.  The value
  of this property is a map of property names to values.
  
  See the {Gradient library}[http://osteele.com/sources/javascript/docs/gradients]
  for an example of how this can be used.
  
  == Usage
    <html>
      <head>
        <-- include the divstyle implementation: -->
        <script type="text/javascript" src="behaviour.js"></script>
        <script type="text/javascript" src="divstyle.js"></script>
      </head>
      <body>
        <!-- define the styles: -->
        <div class="style">
          #e1, .myclass {my-property: 'string', prop1: 123}
          .myclass {prop2: #ff0000}
        </div>
        
        <!-- define the elements.  The styles are applied to these. -->
        <div id="e1"></div>
        <div id="e2" class="myclass"></div>
        <div id="e3" class="myclass"></div>
        
        <!-- access the styles from JavaScript: -->
        <script type="text/javascript">
          alert(document.getElementById('e1').divStyle.myProperty);
          alert(document.getElementById('e2').divStyle.prop1);
          alert(document.getElementById('e3').divStyle.prop2);
          var rules = document.divStylesheet.cssRules; // all the rules
        </script>
       </body>
     </html>
  
  == Caveats
  You can't put the style content in comments. (Safari strips comments
  from the DOM before JavaScript sees them.)
  
  CSS simple selectors are limited to at most one modifier
  (+div.c1+, but not +div.c1.c2+).
  
  Quotes inside an attribute name selector may not work.
  
  The CSS parser is incomplete, and doesn't recover from many parse
  errors.
*/

/*
 * Utilities
 */
try {OSUtils} catch(e) {OSUtils = {}}
if (!OSUtils.Array) {OSUtils.Array = {}}
if (!OSUtils.Hash) {OSUtils.Hash = {}}

OSUtils.Array.union = function (a, b) {
	var c = new Array(a.length);
	for (var i = 0; i < a.length; i++)
		c[i] = a[i];
	for (var i = 0; i < b.length; i++)
		if (!OSUtils.Array.contains(a, b[i]))
			c.push(b[i]);
	return c;
};

OSUtils.Array.contains = function (ar, e) {
	for (var i = 0; i < ar.length; i++)
		if (ar[i] == e)
			return true;
	return false;
};

OSUtils.Hash.update = function(a, b) {
    for (var p in b)
        a[p] = b[p];
	return a;
};

/*
 * DivStyle package
 */
var DivStyle = {};

DivStyle.getStyleSheet = function() {
    if (document.divStylesheet) return document.divStylesheet;
    var styleSheet = new DivStyle.CSSStyleSheet;
    var elements = document.getElementsByTagName('div');
    for (var i = 0, e; e = elements[i++]; )
        if (e.className.match(/\bstyle\b/i)) {
			e.style.display = 'none';
            styleSheet.addRules(e.innerHTML);
		}
    return document.divStylesheet = styleSheet;
};

DivStyle.applyStyles = function () {
    var rules = DivStyle.getStyleSheet().cssRules;
    for (var ri = 0, rule; rule = rules[ri++];) {
        var elements = rule.getSelectedElements();
        for (var ei = 0, e; e = elements[ei++]; ) {
			e.divStyle = e.divStyle || OSUtils.Hash.update({}, DivStyle.defaultProperties);
			OSUtils.Hash.update(e.divStyle, rule.style);
		}
    }
};

DivStyle.propertyDefinitions = {};
DivStyle.defaultProperties = {};

DivStyle.defineProperty = function(name, type, defaultValue) {
    DivStyle.propertyDefinitions[name] = {type: type, defaultValue: defaultValue};
	if (defaultValue != undefined)
		DivStyle.defaultProperties[name] = defaultValue;
};

DivStyle.parseProperty = function(name, value) {
	var definition = DivStyle.propertyDefinitions[name];
	var type = (definition||{}).type;
	switch (type) {
	case 'color':
		return CSSParser.parseColor(value);
	case 'number':
		return parseInt(value);
	}
	return value;
};


/*
 * CSSStyleSheet
 */
DivStyle.CSSStyleSheet = function () {
    this.cssRules = [];
};

DivStyle.CSSStyleSheet.prototype.addRules = function (text) {
    var parser = new CSSParser(new CSSBuilder(this));
    parser.parse(text);
};

DivStyle.CSSStyleSheet.prototype.addRule = function(selector, properties) {
    this.cssRules.push(new DivStyle.CSSRule(selector, properties));
};


/*
 * CSSRule
 */
DivStyle.CSSRule = function(selectors, properties) {
    var newProperties = {};
    for (var p in properties)
        if (p.match(/-/)) {
            var words = p.split(/-/);
            for (var i = 0, w; w = words[i]; i++)
                if (i && w)
                    words[i] = w.charAt(0).toUpperCase() + w.slice(1);
            newProperties[words.join('')] = properties[p];
        }
    for (var p in newProperties)
        properties[p] = newProperties[p];
    this.selectors = selectors;
    this.style = properties;
};

DivStyle.CSSRule.prototype.getSelectedElements = function() {
	var selectors = this.selectors;
	var results = [];
	for (var i = 0, selector; selector = selectors[i++]; ) {
		var selectorText = this.makeSelectorString(selector);
		var elements = document.getElementsBySelector(selectorText) || [];
		results = OSUtils.Array.union(results, elements);
	}
    return results;
};

// make a string that behaviour.js can interpret
DivStyle.CSSRule.prototype.makeSelectorString = function(selector) {
	var s = [];
	for (var i = 0; i < selector.length; i++) {
		var sel = selector[i];
		if (s.length && s[s.length-1].match(/^\w/) && sel.match(/^\w/))
			s.push(' ');
		if (sel.match(/^'.*'$/))
			sel = '"' + sel.slice(1, sel.length-1) + '"';
		s.push(sel);
	}
	return s.join('');
};

/*
 * Parser
 */
function CSSParser(builder) {
    this.builder = builder;
};

CSSParser.ColorNames = {
	aqua: 0x00FFFF,
	black: 0x000000,
	blue: 0x0000FF,
	fuchsia: 0xFF00FF,
	gray: 0x808080,
	green: 0x008000,
	lime: 0x00FF00,
	maroon: 0x800000,
	navy: 0x000080,
	olive: 0x808000,
	purple: 0x800080,
	red: 0xFF0000,
	silver: 0xC0C0C0,
	teal: 0x008080,
	white: 0xFFFFFF,
	yellow: 0xFFFF00
};

CSSParser.parseColor = function(value) {
    if (value.charAt(0) == '#') {
        var n = parseInt(value.slice(1), 16);
        switch (!isNaN(n) && value.length-1) {
        case 3:
            return ((n & 0xf00) << 8 | (n & 0xf0) << 4 | (n & 0xf)) * 17;
        case 6:
            return n;
        }
    }
	if (CSSParser.ColorNames[value])
		return CSSParser.ColorNames[value];
	error('invalid color: ' + value);
	return 0x000000;
};

CSSParser.TOKEN_PATTERNS = {
    IDENT: /^\w[\w\d-]*/,
    STRING: /^"([^\\\"]|\\.)*"|'([^\\\']|\\.)*'/,
    HASH: /^#[\w\d-]+/,
	INCLUDES: /~=/,
	DASHMATCH: /\|=/,
    SKIP_WS: /^\s+/m,
    SKIP_LC: /^\/\/.*/,
    SKIP_BC: /^\/\*([^\*]|\*[^\/])*\*\//m
};

// Codes:
//   '+': append to token list
//   null: ignore
// Errors are ignored.
CSSParser.transitions = {
	initial: {
		'IDENT': ['+'],
		'HASH': ['+'],
		'*': ['+'],
		'.': ['+'],
		'[': ['+', 'attrib'],
		',': ['setSelector'],
		'{': ['endSelector', 'propertyName']
	},
	attrib: {
		'IDENT': ['+'],
		'STRING': ['+'],
		'=': ['+'],
		'INCLUDES': ['+'],
		'DASHMATCH': ['+'], 
		']': ['+', 'initial']
	},
    propertyName: {
		IDENT: ['setPropertyName', 'propertyColon'],
		'}': ['endProperties', 'initial']
	},
    propertyColon: {
		':': [null, 'propertyValue'],
		';': [null, 'propertyName'], // error
		'}': ['endProperties', 'initial'] // error
	},
	propertyValue: {
		IDENT: ['+'],
		HASH: ['+'],
		STRING: ['+'],
		';': ['setPropertyValue', 'propertyName'],
		'}': ['endPropertiesWithValue', 'initial']
	}
};

CSSParser.prototype.nextToken = function () {
    var slice = this.text.slice(this.i);
    if (!slice) return null;
    for (var p in CSSParser.TOKEN_PATTERNS) {
        var m = slice.match(CSSParser.TOKEN_PATTERNS[p]);
        if (m && m.index == 0) {
            this.i += m[0].length;
            if (p.match(/^SKIP/))
                return this.nextToken();
            var value = m[0];
            if (p == 'NUMBER')
                value = parseInt(value);
            return {type: p, value: value};
        }
    }
    var c = this.text.charAt(this.i++);
    return {type: c, value: c};
};

CSSParser.prototype.parse = function(text) {
    this.text = text;
    this.i = 0;
    var state = 'initial';
    var values = [];
    while (true) {
        var token = this.nextToken();
        if (!token) return;
        var entry = CSSParser.transitions[state][token.type];
        if (!entry) throw 'parse error at state ' + state + ', token ' + token;
        var action = entry[0];
		var nextState = entry[1] || state;
        if (action == '+')
            values.push(token.value);
        else if (action) {
            var fn = this.builder[action];
            if (!fn) throw 'unknown action ' + action;
            fn.apply(this.builder, [values, token.value]);
            values = [];
        }
        state = nextState;
    }
};

/*
 * Parser
 */
function CSSBuilder(styleSheet) {
    this.styleSheet = styleSheet;
	this.beginRule();
}

CSSBuilder.prototype.beginRule = function() {
	this.selectors = [];
    this.properties = {};
};

CSSBuilder.prototype.endSelector = function(values) {
	this.selectors.push(values);
};

CSSBuilder.prototype.setPropertyName = function(_, name) {
    this.propertyName = name;
};

CSSBuilder.prototype.setPropertyValue = function(values) {
	var name = this.propertyName;
    var value = values.join(' ');
    this.properties[name] = DivStyle.parseProperty(name, value);
};

CSSBuilder.prototype.endProperties = function() {
    this.styleSheet.addRule(this.selectors, this.properties);
	this.beginRule();
};

CSSBuilder.prototype.endPropertiesWithValue = function(values) {
    this.setPropertyValue(values);
    this.endProperties();
};


/*
 * Initialization
 */

DivStyle.initialize = function() {
	DivStyle.initialize = function () {}
	DivStyle.applyStyles();
};

if (window.addEventListener) {
    window.addEventListener('load', DivStyle.initialize, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', DivStyle.initialize);
} else {
    window.onload = (function() {
        var nextfn = window.onload || function(){};
        return function() {
            DivStyle.initialize();
            nextfn();
        }
    })();
}
