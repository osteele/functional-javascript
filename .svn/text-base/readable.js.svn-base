/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  License: MIT License (Open Source)
  Homepage: http://osteele.com/sources/javascript/
  Docs: http://osteele.com/sources/javascript/docs/readable
  Download: http://osteele.com/sources/javascript/readable.js
  Created: 2006-03-03
  Modified: 2006-03-20
  
  = Description
  +Readable.js+ file adds readable strings for JavaScript values, and
  a simple set of logging commands that use them.
  
  A readable string is intended for use by developers, to faciliate
  command-line and logger-based debugging.  Readable strings
  correspond to the literal representation of a value, except that:
  
  * Collections (arrays and objects) may be optionally be limited in
    length and recursion depth.
  * Functions are abbreviated.  This makes collections that contain
    them more readable.
  * Some inconsistencies noted in the Notes section below.
  
  For example, in JavaScript, <code>[1, '', null ,[3
  ,'4']].toString()</code> evaluates to <tt>"1,,,3,4"</tt>.  This is
  less than helpful for command-line debugging or logging.  With the
  inclusion of this file, the string representation of this object is
  the same as its source representation, and similarly for <code>{a:
  1, b: 2}</code> (which otherwise displays as <tt>[object
  Object]</tt>).
  
  Loading <tt>readable.js</tt> has the following effects:
  
  2. It defines a +Readable+ object.
     <code>Readable.toReadable(value)</code> is equivalent to
     <code>v.toReadable()</code>, except that it can be applied to
     +null+ and +undefined+.

  3. It adds +toReadable+ methods to a several of the builtin
     classes.
     
  3. It optionally replaces <tt>Array.prototype.toString</tt> and
     <tt>Object.prototype.toString</tt> by ...<tt>.toReadable</tt>.
     This makes command-line debugging using Rhino more palatable,
     at the expense of polluting instances of +Object+ and +Array+
     with an extra property that <code>for(...in...)</code> will
     iterate over.
  
  4. It defines +info+, +error+, +warn+, and +debug+ functions that
     can be used to display information to the Rhino console, the
     browser alert dialog,
     fvlogger[http://www.alistapart.com/articles/jslogging], or a
     custom message function.
  
  Read more or leave a comment
  here[http://osteele.com/archives/2006/03/readable-javascript-values].
  
  == Readable API
  === <tt>Readable.represent(value, [options])</tt>
  Returns a string representation of +value+.
  
  === <tt>object.toReadable([options])</tt>
  Returns a string representation of +object+.
  
  === options
  Options is a hash of:
  * +level+ -- how many levels of a nested object to print
  * +length+ -- how many items in a collection to print
  * +stringLength+ -- how many characters of a string to print
  * +omitInstanceFunctions+ -- don't print Object values of type +function+
  
  == toString() replacement
  By default, this file replaces <tt>object.toString()</tt>. and
  <tt>array.toString()</tt> with calls to <tt>toReadable()</tt>.  To
  disable this replacement, define +READABLE_TOSTRING+ to a non-false
  value before loading this file.
  
  In principle, these replacements could break code.  For example,
  code that depends on <code>['one','two','three'].toString()</code>
  evaluating to <tt>"one,two,three"</tt> for serialization or before
  presenting it to a user will no longer work.  In practice, this was
  what was most convenient for me -- it means that I can use the Rhino
  command line to print values readably, without having to wrap them
  in an extra function call.  So that's the default.

  == Logging
  This file defines the logging functions +info+, +warn+, +debug+, and
  +error+.  These are designed to work in the browser or in Rhino, and
  to call +fvlogger+ if it has been loaded.  (For this to work,
  <tt>readable.js</tt> has to load *after* +fvlogger+.)
  
  The functions are defined in one of the following ways:
  
  - If +info+, +warn+, +debug+, and +error+ have type +function+ when
    this file is loaded, the new implementations call the old ones.
    This is the fvlogger compatability mode, and the new functions are
    identical to the fvlogger functions except that (1) they are
    variadic (you can call <code>info(key, '=>', value)</code> instead
    of having to write <code>info(key + '=>' + value)</code>), and (2)
    they apply +toReadable+ to the arguments (which is why the
    variadicity is important).

  - Otherwise, if +alert+ has type +function+ exists, logging calls
    this.  This can be useful in the browser.  (You can replace a
    <tt>ReadableLogger.log</tt> with a function sets the status bar or
    appends text to a <div> instead.)
  
  - Otherwise, if +print+ has type +function+.  This would be the
    Wrong Thing in the browser, but the browser will take the +alert+
    case.  This is for Rhino, which defines +print+ this to print to
    the console.
  
  - Otherwise logging does nothing.  Replace
    <tt>ReadableLogger.log(level, msg)/tt> or
    <tt>ReadableLogger.display(msg)</tt> to change it to do something.
  
  The advantages of calling +info+ (and the other logging functions)
  instead of (in DHTML) +alert+ or (in Rhino) +print+ are:
  * +info+ is variadic
  * +info+ produces readable representations
  * +info+ is compatible between browses and Rhino.  This means you
    can use Rhino for development of logic and other non-UI code, and
    test the code, with logging calls, in both Rhino and the browser.
  
  === Customizing
  Replace <tt>ReadableLogger.log(level, message)</tt> or
  <tt>ReadableLog.display(message)</tt> to customize this behavior.
  
  Logging uses ReadableLogger.defaults to limit the maximum length
  and recursion level.

  == Notes and Bugs
  There's no check for recursive objects.  Setting the +level+ option
  will at least keep the system from recursing infinitely.  (+level+
  is set by default.)
  
  Unicode characters aren't quoted.  This is simple laziness.
  JavaScript keywords that are used as Object property names aren't
  quoted either.  I haven't decided whether this is a bug or a
  feature.
  
  The logging functions intentionally use +toString+ instead of
  +toReadable+ for the arguments themselves.  That is, +a+ but not +b+
  is quoted in <code>info([a], b)</code>.  This is *usually* what you
  want, for uses such as <code>info(key, '=>', value)</code>.  When
  it's not, you can explicitly apply +toReadable+ to the value, e.g.
  <code>info(value.toReadable())</code> or, when +value+ might be
  +undefined+ or +null+, <code>info(Readable.toReadable(value))</code>.
  
  == Related
  {inline-console}[http://osteele.com/sources/javascript/] and
  fvlogger[http://www.alistapart.com/articles/jslogging] both provide
  user interfaces to log messages to a text area within an HTML page.
  +Readable.js+ differs from these libraries in that it customizes the
  string display of objects to these text areas.
  
  {Simple logging for OpenLaszlo}[http://osteele.com/sources/openlaszlo/]
  defines logging functions that are compatible with those defined by this
  file.  This allows libraries that use these functions to be used
  in both OpenLaszlo programs and in DHTML.
  
  ==== JSON
  JSON[http://json.org] stringifies values for computer consumption.
  JSON:
  - Follows a (de facto) standard[http://json.org].
  - Encodes unicode characters in strings.
  - Interoperates with other libraries, including those for other
    languages.
  - Guarantees "round tripping": if an object can be stringified,
    reading the string creates an "equal" object, for a fairly
    intuitive sense of "equal" (that doesn't take into account
    structure sharing).
  
  Readable stringifies values for human consumption.
  Readable:
  - Attempts to stringify all values, including regular expressions.
  - Stringifies +null+, +undefined+, +NaN+, and +Infinity+.
  - Indicates the presence of +Function+ objects in Arrays and Objects.
  - Indicates an Object's constructor.
  - Limits the depth and length of encoded arrays, objects, and strings.
  - Omits inherited properties from Objects.
  - Defines logging functions.
  - Doesn't quote property keys (<tt>{a: 1}</tt>, not <tt>{"a": 1}</tt>).
  - (Optionally) replaces {+Object+, +Array+}<tt>..toString</tt>..
  - (Depending on the browser) indicates the types of native objects
    such as +document+.
*/

// Se we don't overwrite the previous definition of
// Readable.objectToString if the file is loaded twice:
try {if (!Readable) throw "undefined"} catch (e) {
    var Readable = {};
}

Readable.defaults = {
    length: 50,
    level: 5,
    stringLength: 50,
    omitInstanceFunctions: true};

Readable.toReadable = function(value, options) {
    // it's an error to read a property of null or undefined
    if (value == null || value == undefined)
        return String(value);
    
    if (value.constructor && typeof value.constructor.toReadable == 'function')
        return value.constructor.toReadable.apply(value, [options]);

    return Object.toReadable.apply(value, [options]);

    // Safari: some objects don't like to have their properties probed
    // (e.g. properties of document)
        try {typeof value.toReadable == 'function'} catch(e) {return 'y'}
    return 'x';

    if (typeof value.toReadable == 'function') return value.toReadable(options);
    if (typeof value.toString == 'function') return value.toString();
    // Safari: some values don't have properties (e.g. the alert function)
    return '<value>';
};

Readable.charEncodingTable = {'\r': '\\r', '\n': '\\n', '\t': '\\t',
                              '\f': '\\f', '\b': '\\b'};

String.toReadable = function (options) {
    if (options == undefined) options = Readable.defaults;
    var string = this;
    var length = options.stringLength;
    if (length && string.length > length)
        string = string.slice(0, length) + '...';
    string = string.replace(/\\/g, '\\\\');
    for (var c in Readable.charEncodingTable)
		string = string.replace(c, Readable.charEncodingTable[c], 'g');
    if (string.match(/\'/) && !string.match(/\"/))
        return '"' + string + '"';
    else
        return "'" + string.replace(/\'/g, '\\\'') + "'";
};

// save this so we still have access to it after it's replaced, below
Readable.objectToString = Object.toString;

// HTML elements are stringified using a hybrid Prototype/CSS/XPath
// syntax.  If $() is defined, elements with ids are stringified as
// $('id').  Else elements are stringified as
// e.g. document/html/div[2]/div#id/span.class.
Readable.elementToString = function (options) {
	if (this == document) return 'document';
	var s = this.tagName.toLowerCase();
    var parent = this.parentNode;
	if (this.id) {
        try {if (typeof $ == 'function') return "$('" + this.id + "')"}
        catch(e) {}
        s += '#' + this.id;
    } else if (this.className)
        s += '.' + this.className.replace(/\s.*/, '');
	if (parent) {
		var index, count = 0;
		for (var sibling = this.parentNode.firstChild; sibling; sibling = sibling.nextSibling) {
			if (this.tagName == sibling.tagName)
				count++;
			if (this == sibling)
				index = count;
		}
		if (count > 1)
			s += '[' + index + ']';
		s = (parent == document ? '' : arguments.callee.apply(parent, [options]))+'/'+s;
	}
	return s;
};

// Global variables that should be printed by name:
Readable.globals = {'Math': Math};

// Rhino doesn't define these globals:
try {
    Readable.globals['document'] = document;
    Readable.globals['window'] = window;
} catch (e) {}

Object.toReadable = function(options) {
    if (options == undefined) options = Readable.defaults;
	
    for (var name in Readable.globals)
        if (Readable.globals[name] === this)
            return name;
	
    if (this.constructor == Number || this.constructor == Boolean ||
        this.constructor == RegExp || this.constructor == Error ||
        this.constructor == String)
		return this.toString();
	
	if (this.parentNode) try {return Readable.elementToString.apply(this, [options])} catch (e) {}
	
    var level = options.level;
    var length = options.length;
    if (level == 0) length = 0;
    if (level) options.level--;
    var omitFunctions = options.omitFunctions;
    var segments = [];
    var cname = null;
    var delim = '{}';
    if (this.constructor && this.constructor != Object) {
        var cstring = this.constructor.toString();
        var m = cstring.match(/function\s+(\w+)/);
        if (!m) m = cstring.match(/^\[object\s+(\w+)\]$/);
        if (!m) m = cstring.match(/^\[(\w+)\]$/);
        if (m) cname = m[1];
    }
    if (cname) {
        segments.push(cname);
        delim = '()';
        omitFunctions = options.omitInstanceFunctions;
    }
    segments.push(delim.charAt(0));
    var count = 0;
    for (var p in this) {
        var value;
        // accessing properties of document in Firefox throws an
        // exception.  Continue to the next property in case there's
        // anything useful.
        try {value = this[p]} catch(e) {continue}
		// skip inherited properties because there are just too many.
		// except in IE, whcih doesn't have __proto__, so this throws
		// an exception.
        try {if (value == this.__proto__[p]) continue} catch(e) {}
        if (typeof value == 'function' && omitFunctions) continue;
        if (count++) segments.push(', ');
        if (length >= 0 && count > length) {
            segments.push('...');
            break;
        }
        segments.push(p.toString());
        segments.push(': ');
        segments.push(Readable.toReadable(value, options));
    }
    if (level) options.level = level;
    return segments.join('') + delim.charAt(1);
};

Array.toReadable = function(options) {
    if (options == undefined) options = Readable.defaults;
    var level = options.level;
    var length = options.length;
    if (level == 0) return '[...]';
    if (level) options.level--;
    var segments = [];
    for (var i = 0; i < this.length; i++) {
        if (length >= 0 && i >= length) {
            segments.push('...');
            break;
        }
        segments.push(Readable.toReadable(this[i], options));
    }
    if (level) options.level = level;
    return '[' + segments.join(', ') + ']';
};

Function.toReadable = function(options) {
    if (options == undefined) options = Readable.defaults;
    var string = this.toString();
    if (!options.printFunctions) {
        var match = string.match(/(function\s+\w*)/);
        if (match)
            string = match[1] + '() {...}';
    }
    return string;
};

// Replace {Object,Array}.prototype.toString unless const_defined(READABLE_TOSTRING)
try {
    if (!READABLE_TOSTRING) throw "break";
} catch (e) {
    READABLE_TOSTRING = false; // in case the file is loaded twice
    // call rather than replace, to pick up subclass overrides
    Object.prototype.toString = function () {return Object.toReadable.apply(this)}
    // but don't worry about that here, yet...
    Array.prototype.toString = Array.toReadable;
    
    // Don't replace {String,Function}..toString.  Too much might rely
    // on the spec'ed behavior, especially for string.
}

var ReadableLogger = {};

ReadableLogger.defaults = {
    length: 10,
    stringLength: 50,
    level: 2,
    omitInstanceFunctions: true};

// function(message)
// Aliased to whichever of +alert+ (DHTML) and +print+ (Rhino) is a function,
// else to a null function.
ReadableLogger.display = (function () {
        try {if (typeof alert == 'function') return alert} catch (e) {}
        try {if (typeof print == 'function') return print} catch (e) {}
        return function (){};
    })();

// function(level, message) --- log the message
// Aliased to a dispatcher to {debug, info, warn, error} if these are
// all functions, else to a function that calls +display+.
ReadableLogger.log =
    (function() {
        try {
            // if all of these are functions, use them
            var loggers = {debug: debug, info: info, warn: warn, error: error};
            for (var i in loggers)
                if (typeof loggers[i] != 'function')
                    throw 'break';
            return function(level, message) {loggers[level](message)};
        } catch (e) {
            return function(level, message) {
                ReadableLogger.display(level + ': ' + message);
            }
        }
    })();

// function(level, args...)
// log with message level (info, warn, debug, or error), and an array of values
ReadableLogger.logValues = function(level, args) {
    var segments = [];
    for (var i = 0; i < args.length; i++) {
        var value = args[i];
        if (typeof value != 'string')
            value = Readable.toReadable(value, ReadableLogger.defaults);
        segments.push(value);
    }
    var msg = segments.join(', ');
    ReadableLogger.log(level, msg);
};

// These are assignments rather than definitions, so that they
// are evaluated *after* the attempt to construct the +loggers+
// hash in the evaluation of <tt>Readable.log</tt>.
info = function() {ReadableLogger.logValues('info', arguments)}
warn = function() {ReadableLogger.logValues('warn', arguments)}
debug = function() {ReadableLogger.logValues('debug', arguments)}
error = function() {ReadableLogger.logValues('error', arguments)}
