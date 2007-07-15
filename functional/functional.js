/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Source: http://osteele.com/javascripts/functional/functional.js
 * Version: 1.0
 * Created: 2007-07-11
 * Modified: 2007-07-14
 *
 * This file defines some higher-order functions for partial function
 * application, as well as some other utilities for functional programming.
 * It also defines methods that allow a string such as 'x+1' or
 * 'x -> x+1' to be used as though it were a function.
 */


// A namespace for higher-order functions.
var Functional = window.Functional || {};

// ^ Higher-order functions

// Copies all the functions in +Functional+ (except this one)
// into the global namespace.
// >> Functional.install()
Functional.install = function() {
    var source = Functional;
    var target = window;
    // the {}[name] works around Prototype
    for (var name in source)
        name == 'install' || name == 'functionMethods' || {}[name] || (target[name] = source[name]);
    Functional.install = Function.I;
}

// Returns a function that applies the last argument of this
// function to its input, and the penultimate argument to this,
// and so on.
// == compose(f1, f2, f3..., fn)(args) == f1(f2(f3(...(fn(args...)))))
// :: (a2 -> a1) (a3 -> a2)... (a... -> an) -> a... -> a1
// >> compose('1+', '2*')(2) -> 5
Functional.compose = function(/*fn...*/) {
    var fns = Functional.map(Function.toFunction, arguments);
    return function() {
        for (var i = fns.length; --i >= 0; )
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

// Same as +compose+, except applies the functions in argument-list order.
// == sequence(f1, f2, f3..., fn)(args...) == fn(...(f3(f2(f1(args...)))))
// :: (a... -> a1) (a1 -> a2) (a2 -> a3)... (a[n-1] -> an)  -> a... -> an
// >> sequence('1+', '2*')(2) -> 6
Functional.sequence = function(/*fn...*/) {
    var fns = Functional.map(Function.toFunction, arguments);
    return function() {
        for (var i = 0; i < fns.length; i++)
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

// Applies +fn+ to each element of +sequence+.
// == map(f, [x1, x2...]) = [f(x, 0), f(x2, 1), ...]
// :: (a ix -> boolean) [a] -> [a]
// >> map('1+', [1,2,3]) -> [2, 3, 4]
// The fusion rule:
// >> map('+1', map('*2', [1,2,3]))) -> [3, 5, 7]
// >> map(compose('+1', '*2'), [1,2,3])) -> [3, 5, 7]

Functional.map = function(fn, sequence, object) {
    arguments.length < 3 && (receiver = this);
    fn = Function.toFunction(fn);
    var len = sequence.length;
    var result = new Array(len);
    for (var i = 0; i < len; i++)
        result[i] = fn.apply(object, [sequence[i], i]);
    return result;
}

// Applies +fn+ to +init+ and the first element of +sequence+,
// and then to the result and the second element, and so on.
// == reduce(fn, init, [x1, x2, x3]) == fn(fn(fn(init, x1), x2), x3)
// :: (a b -> a) a [b] -> a
// >> reduce('x y -> 2*x+y', 0, [1,0,1,0]) -> 10
Functional.reduce = function(fn, init, sequence, object) {
    arguments.length < 4 && (receiver = this);
    fn = Function.toFunction(fn);
    var len = sequence.length;
    var result = init;
    for (var i = 0; i < len; i++)
        result = fn.apply(object, [result, sequence[i]]);
    return result;
}

// Returns a list of those elements +x+ of +sequence+ such that
// +fn(x)+ returns true.
// :: (a -> boolean) [a] -> [a]
// >> select('%2', [1,2,3,4]) -> [1, 3]
Functional.select = function(fn, sequence, receiver) {
    arguments.length < 3 && (receiver = this);
    fn = Function.toFunction(fn);
    var len = sequence.length;
    var result = [];
    for (var i = 0; i < len; i++) {
        var x = sequence[i];
        fn.apply(receiver, [x, i]) && result.push(x);
    }
    return result;
}

// A synonym for +select+.
Functional.filter = Functional.select;

// A synonym for +reduce+.
Functional.foldl = Functional.reduce;

// Same as +foldl+, but applies the function from right to left.
// == foldr(fn, init, [x1, x2, x3]) == fn(x1, fn(x2, fn(x3, init)))
// :: (a b -> b) b [a] -> b
// >> foldr('x y -> 2*x+y', 100, [1,0,1,0]) -> 104
Functional.foldr = function(fn, init, sequence, object) {
    arguments.length < 4 && (receiver = this);
    fn = Function.toFunction(fn);
    var len = sequence.length;
    var result = init;
    for (var i = len; --i >= 0; )
        result = fn.apply(object, [sequence[i], result]);
    return result;
}

// ^^ Predicates

// Returns true when +fn(x)+ returns true for some element +x+ of
// +sequence+.
// == some(fn, [x1, x2, x3]) == fn(x1) || fn(x2) || fn(x3)
// :: (a -> boolean) [a] -> [a]
// >> some('>2', [1,2,3]) -> true
// >> some('>10', [1,2,3]) -> false
Functional.some = function(fn, sequence, receiver) {
    arguments.length < 3 && (receiver = this);
    fn = Function.toFunction(fn);
    var len = sequence.length;
    var result = [];
    var value = false;
    for (var i = 0; i < len; i++) {
        value = fn.call(receiver, sequence[i]);
        if (value) return value;
    }
    return value;
}

// Returns true when +fn(x)+ is true for every element +x+ of
// +sequence+.
// == every(fn, [x1, x2, x3]) == fn(x1) && fn(x2) && fn(x3)
// :: (a -> boolean) [a] -> [a]
// >> every('<2', [1,2,3]) -> false
// >> every('<10', [1,2,3]) -> true
Functional.every = function(fn, sequence, receiver) {
    arguments.length < 3 && (receiver = this);
    fn = Function.toFunction(fn);
    var len = sequence.length;
    var result = [];
    var value = true;
    for (var i = 0; i < len; i++) {
        value = fn.call(receiver, sequence[i]);
        if (!value) return value;
    }
    return value;
}

// Returns a function that returns true when +fn()+ returns false.
// == fn.not()(args...) == !fn(args...)
// :: (a -> boolean) -> (a -> boolean)
// >> not(Function.K(true))() -> false
// >> not(Function.K(false))() -> true
Functional.not = function(fn) {
    fn = Function.toFunction(fn);
    return function() {  
        return !fn.apply(null, arguments);
    }
}

// ^^ Utilities

// Returns a function that takes an object as an argument, and applies
// +object+'s +methodName+ method to +arguments+.
// == fn(name)(object, args...) == object[name](args...)
// :: name args.. -> object args2... -> object[name](args... args2...)
// >> invoke('toString')(123) -> "123"
Functional.invoke = function(methodName/*, arguments*/) {
    var args = [].slice.call(arguments, 1);
    return function(object) {
        return object[methodName].apply(object, [].slice.call(arguments, 1).concat(args));
    }
}

// Returns a function that takes an object, and returns the value of its
// +name+ property.  +pluck(name)+ is the same as '_.name'.lambda().
// == fn.pluck(name)(object) == object[name]
// :: name -> object -> object[name]
// >> pluck('length')("abc") -> 3
Functional.pluck = function(name) {
    return function(object) {
        return object[name];
    }
}

// Returns a function +fn+ that, while +pred(value)+ is true, applies +fn+ to
// +value+ to produce a new value, which is used as an input for the next round.
// +fn+ returns the first +value+ for which +pred(value)+ is false.
// :: (a -> boolean) (a -> a) -> a
// >> until('>10', '2*')(1) -> 16
Functional.until = function(pred, fn) {
    fn = Function.toFunction(fn);
    pred = Function.toFunction(pred);
    return function(value) {
        while (!pred.call(null, value))
            value = fn.call(null, value);
        return value;
    }
}

// You know that +zip+ can transpose a matrix,
// don't you?
// :: [a] [b]... -> [[a b]...]
// == zip(a, b...) == [[a[0], b[0]], [a[1], b[1]], ...]
// >> zip.apply(null, [[1,2],[3,4]]) -> [[1, 3], [2, 4]]
Functional.zip = function(/*args...*/) {
    var n = Math.min.apply(null, map('.length', arguments));
    var results = new Array(n);
    for (var i = 0; i < n; i++) {
        var key = String(i);
        results[key] = map(pluck(key), arguments);
    };
    return results;
}

Functional._startRecordingMethodChanges = function(object) {
    var initialMethods = {};
    for (var name in object)
        initialMethods[name] = object[name];
    return {getChangedMethods: function() {
        var changedMethods = {};
        for (var name in object)
        if (object[name] != initialMethods[name])
            changedMethods[name] = object[name];
        return changedMethods;
    }};
}

// For each method that this file defined on Function.prototype,
// define a function on Functional that delegates to it.
Functional._attachMethodDelegates = function(methods) {
    for (var name in methods)
        Functional[name] = (function(name) {
            var fn = methods[name];
            return function(object) {
                return fn.apply(Function.toFunction(object), [].slice.call(arguments, 1));
            }
        })(name);
}

// Record the current contents of Function.prototype, so that we
// can see what we've added later.
Functional.__initalFunctionState = Functional._startRecordingMethodChanges(Function.prototype);

// ^ First-order combinators

// The identity function: x -> x.
// == I(x) == x
// :: a -> a
// >> Function.I(1) -> 1
Function.I = function(x) {return x};

// Returns a constant function that returns +x+.
// == K(x)(y) == x
// :: a -> b -> a
Function.K = function(x) {return function() {return x}}

// ^ Higher-order methods
// 
// In addition to the functions defined
// below, every method defined above on +Function+ is also available as a function
// in +Functional+, that coerces its first argument to a +Function+ and applies
// the remaining arguments to it.
// == curry(fn, args...) == fn.curry(args...)
// >> Functional.flip('a/b')(1, 2) -> 2
// >> Functional.curry('a/b', 1)(2) -> 0.5

// Returns a function that swaps its first two arguments before
// passing them to the underlying function.
// == fn.flip()(a, b, c...) == fn(b, a, c...)
// :: (a b c...) -> (b a c...)
// >> ('a/b'.lambda()).flip()(1,2) -> 2
Function.prototype.flip = function() {
    var fn = this;
    return function() {
        var args = [].slice.call(arguments, 0);
        args = args.slice(1,2).concat(args.slice(0,1)).concat(args.slice(2));
        return fn.apply(this, args);
    }
}

// Returns a function that applies the underlying function to its
// first argument, and the result of that application to the remaining
// arguments.
// == fn.uncurry(a, b...) == fn(a)(b...)
// :: (a -> b -> c) -> (a, b) -> c
// >> ('a -> b -> a/b'.lambda()).uncurry()(1,2) -> 0.5
Function.prototype.uncurry = function() {
    var fn = this;
    return function() {
        var f1 = fn.apply(this, [].slice.call(arguments, 0, 1));
        return f1.apply(this, [].slice.call(arguments, 1));
    }
}

// ^^ Partial function application

// Returns a bound method on +object+; optionally currying +args+.
// == fn.bind(obj, args...)(args2...) == fn.apply(obj, [args..., args2...])
Function.prototype.bind = function(object/*, args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat([].slice.call(arguments, 0)));
    }
}

// Returns a function that ignores its arguments.
// :: (a... -> b) a... -> (... -> b)
// == fn.saturate(args...)(args2..) == fn(args...)
// >> Math.max.curry(1, 2)(3, 4) -> 4
// >> Math.max.saturate(1, 2)(3, 4) -> 2
// >> Math.max.curry(1, 2).saturate()(3, 4) -> 2
Function.prototype.saturate = function(/*args*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args);
    }
}

// Returns a function that, applied to an argument list +arg2+,
// applies the underlying function to +args+ ++ +arg2+.
// :: (a... b... -> c) a... -> (b... -> c)
// == fn.curry(args...)(args2...) == fn(args..., args2...)
// Note that, unlike in languages with true partial application such as Haskell,
// +curry+ and +uncurry+ are not inverses.  This is a repercussion of the
// fact that in JavaScript, unlike Haskell, a fully saturated function is
// not equivalent to the value that it returns.  The definition of +curry+
// here matches semantics that most people have used when implementing curry
// for procedural languages.
// 
// This implementation is adapted from
// http://www.coryhudson.com/blog/2007/03/10/javascript-currying-redux/
Function.prototype.curry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args.concat([].slice.call(arguments, 0)));
    };
}

// Right curry.  Returns a function that, applied to an argumen list +args2+,
// applies the underlying function to +args2+ + +args+.
// == fn.curry(args...)(args2...) == fn(args2..., args...)
// :: (a... b... -> c) b... -> (a... -> c)
Function.prototype.rcurry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, [].slice.call(arguments, 0).concat(args));
    };
}

// Same as +curry+, except only applies the function when all
// +n+ arguments are saturated.
Function.prototype.ncurry = function(n/*, args...*/) {
    var fn = this;
    var largs = [].slice.call(arguments, 1);
    return function() {
        var args = largs.concat([].slice.call(arguments, 0));
        if (args.length < n) {
            args.unshift(n);
            return fn.ncurry.apply(fn, args);
        }
        return fn.apply(this, args);
    };
}

// Same as +rcurry+, except only applies the function when all
// +n+ arguments are saturated.
Function.prototype.rncurry = function(n/*, args...*/) {
    var fn = this;
    var rargs = [].slice.call(arguments, 1);
    return function() {
        var args = [].slice.call(arguments, 0).concat(rargs);
        if (args.length < n) {
            args.unshift(n);
            return fn.rncurry.apply(fn, args);
        }
        return fn.apply(this, args);
    };
}

// +_+ (underscore) is bound to a unique value for use in +partial()+, below.
var _ = {};

// Returns a function +f+ such that +f(args2)+ is equivalent to
// the underlying function applied to a combination of +args+ and +args2+.
// 
// +args+ is a partially-specified argument: it's a list with "holes",
// specified by the special value +_+.  It is combined with +args2+ as
// follows:
// 
// From left to right, each value in +args2+ fills in the leftmost
// remaining hole in +args+.  Any remaining values
// in +args2+ are appended to the result of the filling-in process
// to produce the combined argument list.
// 
// If the combined argument list contains any occurrences of +_+, the result
// of the application of +f+ is another partial function.  Otherwise, the
// result is the same as the result of applying the underlying function to
// the combined argument list.
Function.prototype.partial = function(/*args*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    // substitution positions
    var subpos = [], value;
    for (var i = 0; i < arguments.length; i++)
        arguments[i] == _ && subpos.push(i);
    return function() {
        var specialized = args.concat([].slice.call(arguments, subpos.length));
        for (var i = 0; i < Math.min(subpos.length, arguments.length); i++)
            specialized[subpos[i]] = arguments[i];
        for (var i = 0; i < specialized.length; i++)
            if (specialized[i] == _)
                return fn.partial.apply(fn, specialized);
        return fn.apply(this, specialized);
    }
}

// For each method that this file defined on Function.prototype,
// define a function on Functional that delegates to it.
Functional._attachMethodDelegates(Functional.__initalFunctionState.getChangedMethods());
delete Functional.__initalFunctionState;


// ^ String lambdas

// Turns a string that contains a JavaScript expression into a
// +Function+ that returns the value of that expression.
// 
// If the string contains a '->', this separates the parameters from the body:
// >> 'x -> x + 1'.lambda()(1) -> 2
// >> 'x y -> x + 2*y'.lambda()(1, 2) -> 5
// >> 'x, y -> x + 2*y'.lambda()(1, 2) -> 5
// 
// Otherwise, if the string contains a '_', this is the parameter:
// >> '_ + 1'.lambda()(1) -> 2
// 
// Otherwise if the string begins or ends with an operator or relation,
// prepend or append a parameter.  (The documentation refers to this type
// of string as a "section".)
// >> '/2'.lambda()(4) -> 2
// >> '2/'.lambda()(4) -> 0.5
// >> '/'.lambda()(2,4) -> 0.5
// Sections can end, but not begin with, '-'.  (This is to avoid interpreting
// e.g. '-2*x' as a section).  On the other hand, a string that either begins
// or ends with '/' is a section, so an expression that begins or ends with a
// regular expression literal needs an explicit parameter.
// 
// Otherwise, each variable name is an implicit parameter:
// >> 'x + 1'.lambda()(1) -> 2
// >> 'x + 2*y'.lambda()(1, 2) -> 5
// >> 'y + 2*x'.lambda()(1, 2) -> 5
// 
// Implicit parameter detection ignores strings literals, variable names that
// start with capitals, and identifiers that precede ':' or follow '.':
// >> map('"im"+root', ["probable", "possible"]) -> ["improbable", "impossible"]
// >> 'Math.cos(angle)'.lambda()(Math.PI) -> -1
// >> 'point.x'.lambda()({x:1, y:2}) -> 1
// >> '({x:1, y:2})[key]'.lambda()('x') -> 1
// 
// Implicit parameter detection looks inside regular expression literals for
// variable names.  It doesn't know to ignore JavaScript keywords and bound variables.
// (The only way you can get these last two if with a function literal inside the
// string.  This is outside the use case for string lambdas.)
// Use _ (to define a unary function) or ->, if the string contains anything
// that looks like a free variable but shouldn't be used as a parameter, or
// to specify parameters that are ordered differently from their first
// occurrence in the string.
// 
// Chain '->'s to create a function in uncurried form:
// >> 'x -> y -> x + 2*y'.lambda()(1)(2) -> 5
// >> 'x -> y -> z -> x + 2*y+3*z'.lambda()(1)(2)(3) -> 14
String.prototype.lambda = function() {
    var params = [];
    var expr = this;
    var sections = expr.split(/\s*->\s*/);
    if (sections.length > 1) {
        while (sections.length) {
            expr = sections.pop();
            params = sections.pop().split(/\s*,\s*|\s+/);
            sections.length && sections.push('(function('+params+'){return ('+expr+')})');
        }
    } else if (expr.match(/\b_\b/)) {
        params = '_';
    } else {
        var m1 = expr.match(/^\s*[+*\/%&|^!\.=<>]/);
        var m2 = expr.match(/[+\-*\/%&|^!\.=<>]\s*$/);
        if (m1 || m2) {
            if (m1) {
                params.push('$1');
                expr = '$1' + expr;
            }
            if (m2) {
                params.push('$2');
                expr = expr + '$2';
            }
        } else {
            var vars = this.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*:|this|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '').match(/([a-z_$][a-z_$\d]*)/gi) || []; // '
            for (var i = 0, v; v = vars[i++]; )
                params.indexOf(v) >= 0 || params.push(v);
        }
    }
    return new Function(params, 'return (' + expr + ')');
}

// ^^ Duck-Typing
// Strings support +call+ and +apply+.  This duck-types them as
// functions, to some callers.

// Coerce the string to a function and then apply it.
// >> 'x+1'.apply(null, [2]) -> 3
// >> '/'.apply(null, [2, 4]) -> 0.5
String.prototype.apply = function(thisArg, args) {
    return this.toFunction().apply(thisArg, args);
}

// Coerce the string to a function and then call it.
// >> 'x+1'.call(null, 2) -> 3
// >> '/'.call(null, 2, 4) -> 0.5
String.prototype.call = function() {
    return this.toFunction().apply(arguments[0], [].slice.call(arguments, 1));
}

// ^^ Coercion 

// Returns a Function that perfoms the action described by this
// string.  If the string contains a 'return', applies
// 'new Function' to it.  Otherwise, calls +lambda+.
// >> '+1'.toFunction()(2) -> 3
// >> 'return 1'.toFunction()(1) -> 1
String.prototype.toFunction = function() {
    var body = this;
    if (body.match(/\breturn\b/))
        return new Function(this);
    return this.lambda();
}

// Returns this function.  +Function.toFunction+ calls this.
// >> '+1'.lambda().toFunction()(2) -> 3
Function.prototype.toFunction = function() {
    return this;
}

// Coerces +fn+ into a function if it is not already one,
// by calling its +toFunction+ method.
// >> Function.toFunction(function() {return 1})() -> 1
// >> Function.toFunction('+1')(2) -> 3
// Function.toFunction doesn't coerce arbitrary values to functions.
// It might seem convenient to treat
// Function.toFunction(value) as though it were the
// constant function that returned +value+, but it's rarely
// useful and it hides errors.  Use Function.K(value) instead.
Function.toFunction = function(value) {
    return value.toFunction();
}
