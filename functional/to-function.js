/*
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Created: 2007-07-11
 * Version: 1.0.2
 *
 *
 * This defines "string lambdas", that allow strings such as `x+1` and
 * `x -> x+1` to be used in some contexts as functions.
 */


/// ^ String lambdas

/**
 * Turns a string that contains a JavaScript expression into a
 * `Function` that returns the value of that expression.
 *
 * If the string contains a `->`, this separates the parameters from the body:
 * >> 'x -> x + 1'.lambda()(1) -> 2
 * >> 'x y -> x + 2*y'.lambda()(1, 2) -> 5
 * >> 'x, y -> x + 2*y'.lambda()(1, 2) -> 5
 *
 * Otherwise, if the string contains a `_`, this is the parameter:
 * >> '_ + 1'.lambda()(1) -> 2
 *
 * Otherwise if the string begins or ends with an operator or relation,
 * prepend or append a parameter.  (The documentation refers to this type
 * of string as a "section".)
 * >> '/2'.lambda()(4) -> 2
 * >> '2/'.lambda()(4) -> 0.5
 * >> '/'.lambda()(2,4) -> 0.5
 * Sections can end, but not begin with, `-`.  (This is to avoid interpreting
 * e.g. `-2*x` as a section).  On the other hand, a string that either begins
 * or ends with `/` is a section, so an expression that begins or ends with a
 * regular expression literal needs an explicit parameter.
 *
 * Otherwise, each variable name is an implicit parameter:
 * >> 'x + 1'.lambda()(1) -> 2
 * >> 'x + 2*y'.lambda()(1, 2) -> 5
 * >> 'y + 2*x'.lambda()(1, 2) -> 5
 *
 * Implicit parameter detection ignores strings literals, variable names that
 * start with capitals, and identifiers that precede `:` or follow `.`:
 * >> map('"im"+root', ["probable", "possible"]) -> ["improbable", "impossible"]
 * >> 'Math.cos(angle)'.lambda()(Math.PI) -> -1
 * >> 'point.x'.lambda()({x:1, y:2}) -> 1
 * >> '({x:1, y:2})[key]'.lambda()('x') -> 1
 *
 * Implicit parameter detection mistakenly looks inside regular expression
 * literals for variable names.  It also doesn't know to ignore JavaScript
 * keywords and bound variables.  (The only way you can get these last two is
 * with a function literal inside the string.  This is outside the intended use
 * case for string lambdas.)
 *
 * Use `_` (to define a unary function) or `->`, if the string contains anything
 * that looks like a free variable but shouldn't be used as a parameter, or
 * to specify parameters that are ordered differently from their first
 * occurrence in the string.
 *
 * Chain `->`s to create a function in uncurried form:
 * >> 'x -> y -> x + 2*y'.lambda()(1)(2) -> 5
 * >> 'x -> y -> z -> x + 2*y+3*z'.lambda()(1)(2)(3) -> 14
 *
 * `this` and `arguments` are special:
 * >> 'this'.call(1) -> 1
 * >> '[].slice.call(arguments, 0)'.call(null,1,2) -> [1, 2]
 */
String.prototype.lambda = function() {
    var params = [],
        expr = this,
        sections = expr.ECMAsplit(/\s*->\s*/m);
    if (sections.length > 1) {
        while (sections.length) {
            expr = sections.pop();
            params = sections.pop().split(/\s*,\s*|\s+/m);
            sections.length && sections.push('(function('+params+'){return ('+expr+')})');
        }
    } else if (expr.match(/\b_\b/)) {
        params = '_';
    } else {
        // test whether an operator appears on the left (or right), respectively
        var leftSection = expr.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m),
            rightSection = expr.match(/[+\-*\/%&|\^\.=<>!]\s*$/m);
        if (leftSection || rightSection) {
            if (leftSection) {
                params.push('$1');
                expr = '$1' + expr;
            }
            if (rightSection) {
                params.push('$2');
                expr = expr + '$2';
            }
        } else {
            // `replace` removes symbols that are capitalized, follow '.',
            // precede ':', are 'this' or 'arguments'; and also the insides of
            // strings (by a crude test).  `match` extracts the remaining
            // symbols.
            var vars = this.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '').match(/([a-z_$][a-z_$\d]*)/gi) || []; // '
            for (var i = 0, v; v = vars[i++]; )
                params.indexOf(v) >= 0 || params.push(v);
        }
    }
    return new Function(params, 'return (' + expr + ')');
}

/// Turn on caching for `string` -> `Function` conversion.
String.prototype.lambda.cache = function() {
    var proto = String.prototype,
        cache = {},
        uncached = proto.lambda,
        cached = function() {
	        var key = '#' + this; // avoid hidden properties on Object.prototype
	        return cache[key] || (cache[key] = uncached.call(this));
        };
    cached.cached = function(){};
    cached.uncache = function(){proto.lambda = uncached};
    proto.lambda = cached;
}

/**
 * ^^ Duck-Typing
 *
 * Strings support `call` and `apply`.  This duck-types them as
 * functions, to some callers.
 */

/**
 * Coerce the string to a function and then apply it.
 * >> 'x+1'.apply(null, [2]) -> 3
 * >> '/'.apply(null, [2, 4]) -> 0.5
 */
String.prototype.apply = function(thisArg, args) {
    return this.toFunction().apply(thisArg, args);
}

/**
 * Coerce the string to a function and then call it.
 * >> 'x+1'.call(null, 2) -> 3
 * >> '/'.call(null, 2, 4) -> 0.5
 */
String.prototype.call = function() {
    return this.toFunction().apply(arguments[0],
                                   Array.prototype.slice.call(arguments, 1));
}

/// ^^ Coercion

/**
 * Returns a `Function` that perfoms the action described by this
 * string.  If the string contains a `return`, applies
 * `new Function` to it.  Otherwise, this function returns
 *  the result of `this.lambda()`.
 * >> '+1'.toFunction()(2) -> 3
 * >> 'return 1'.toFunction()(1) -> 1
 */
String.prototype.toFunction = function() {
    var body = this;
    if (body.match(/\breturn\b/))
        return new Function(this);
    return this.lambda();
}

/**
 * Returns this function.  `Function.toFunction` calls this.
 * >> '+1'.lambda().toFunction()(2) -> 3
 */
Function.prototype.toFunction = function() {
    return this;
}

/**
 * Coerces `fn` into a function if it is not already one,
 * by calling its `toFunction` method.
 * >> Function.toFunction(function() {return 1})() -> 1
 * >> Function.toFunction('+1')(2) -> 3
 *
 * `Function.toFunction` requires an argument that can be
 * coerced to a function.  A nullary version can be
 * constructed via `guard`:
 * >> Function.toFunction.guard()('1+') -> function()
 * >> Function.toFunction.guard()(null) -> null
 *
 * `Function.toFunction` doesn't coerce arbitrary values to functions.
 * It might seem convenient to treat
 * `Function.toFunction(value)` as though it were the
 * constant function that returned `value`, but it's rarely
 * useful and it hides errors.  Use `Functional.K(value)` instead,
 * or a lambda string when the value is a compile-time literal:
 * >> Functional.K('a string')() -> "a string"
 * >> Function.toFunction('"a string"')() -> "a string"
 */
Function.toFunction = function(value) {
    return value.toFunction();
}

// Utilities

// IE6 split is not ECMAScript-compliant.  This breaks '->1'.lambda().
// ECMAsplit is an ECMAScript-compliant `split`, although only for
// one argument.
String.prototype.ECMAsplit =
    // The test is from the ECMAScript reference.
    ('ab'.split(/a*/).length > 1
     ? String.prototype.split
     : function(separator, limit) {
         if (typeof limit != 'undefined')
             throw "ECMAsplit: limit is unimplemented";
         var result = this.split.apply(this, arguments),
             re = RegExp(separator),
             savedIndex = re.lastIndex,
             match = re.exec(this);
         if (match && match.index == 0)
             result.unshift('');
         // in case `separator` was already a RegExp:
         re.lastIndex = savedIndex;
         return result;
     });
