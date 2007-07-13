/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional.html
 * Source: http://osteele.com/javascripts/functional.js
 * Created: 2007-07-11
 * Modified: 2007-07-12
 *
 * This file defines some higher-order functions for partial function
 * application, as well as some other utilities for functional programming.
 * It also defines methods that allow a string such as 'x+1' or
 * 'x -> x+1' to be used as though it were a function.
 */

// ^ First-order combinators

// The identity function: x -> x.
// == I(x) == x
// :: a -> a
Function.I = function(x) {return x};

// Returns a constant function that returns +x+.
// == K(x)(y) == x
// :: a -> b -> a
Function.K = function(x) {return function() {return x}}

// ^ Higher-order methods

// Returns a function that swaps its first two arguments before
// passing them to the underlying function.
// == fn.flip()(n1, n2, n3...) == fn(n2, n1, n3...)
// :: (a b c...) -> (b a c...)
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
Function.prototype.uncurry = function() {
    var fn = this;
    return function() {
        var f1 = fn.apply(this, [].slice.call(arguments, 0, 1));
        return f1.apply(this, [].slice.call(arguments, 1));
    }
}

Function.prototype.prefilter = function(pos, filter) {
    var fn = this;
    filter = Function.toFunction(filter);
    return function() {
        var args = [].slice.call(arguments, 0);
        args[pos] = filter(args[pos]);
        return fn.apply(this, args);
    }
}

// ^^ Partial function application

// Returns a bound method on +object+; optionally currying +args+.
// == fn.bind(obj)(args...) == fn.apply(obj, [args...])
Function.prototype.bind = function(object/*, args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat([].slice.call(arguments, 0)));
    }
}

// Binds this function to +args+.  The returned function ignores
// its arguments.
// == fn.bind(args...)(args2..) == fn(args...)
// :: (a... -> b) a... -> (... -> b)
Function.prototype.args = function(/*args*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args);
    }
}

// Returns a function that, applied to an argument list +arg2+,
// applies the underlying function to +args+ ++ +arg2+.
// == fn.curry(args...)(args2...) == fn(args..., args2...)
// Adapted from http://www.coryhudson.com/blog/2007/03/10/javascript-currying-redux/
// :: (a... b... -> c) a... -> (b... -> c)
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
// +args+ is a partially-specified argument: it's a list with 'holes',
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

// ^ Higher-order functions

// A namespace for higher-order functions.
var Functional = window.Functional || {};

// Copies all the functions in +Functional+ (except this one)
// into the global namespace.
Functional.install = function() {
    var source = Functional;
    var target = window;
    // the {}[name] works around Prototype
    for (var name in source)
        name == 'install' || {}[name] || (target[name] = source[name]);
}

// Returns a function that applies the last argument of this
// function to its input, and the penultimate argument to this,
// and so on.
// == compose(f1, f2, f3..., fn)(args) == f1(f2(f3(...(fn(args...)))))
// :: (a2 -> a1) (a3 -> a2)... (a... -> an) -> a... -> a1
Functional.compose = function(/*fn...*/) {
    var fns = Functional.map(Function.toFunction, arguments);
    return function() {
        for (var i = fns.length; --i >= 0; )
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

// Same as +compose+, except applies the functions from front to back.
// == sequence(f1, f2, f3..., fn)(args) == fn(...(f3(f2(f1(args...)))))
// :: (a... -> a1) (a1 -> a2) (a2 -> a3)... (a[n-1] -> an)  -> a... -> an
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
// :: (a b -> b) a [b] -> b
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

// ^^ Predicates

// Returns true when +fn(x)+ returns true for some element +x+ of
// +sequence+.
// == some(fn, [x1, x2, x3]) == fn(x1) || fn(x2) || fn(x3)
// :: (a -> boolean) [a] -> [a]
Functional.some = function(fn, sequence, receiver) {
    arguments.length < 3 && (receiver = this);
    fn = Function.toFunction(fn);
    var len = sequence.length;
    var result = [];
    var value = false;
    for (var i = 0; i < len; i++) {
        value = fn.apply(receiver, [sequence[i]]);
        if (value) return value;
    }
    return value;
}

// Returns true when +fn(x)+ is true for every element +x+ of
// +sequence+.
// == every(fn, [x1, x2, x3]) == fn(x1) && fn(x2) && fn(x3)
// :: (a -> boolean) [a] -> [a]
Functional.every = function(fn, sequence, receiver) {
    arguments.length < 3 && (receiver = this);
    fn = Function.toFunction(fn);
    var len = sequence.length;
    var result = [];
    var value = true;
    for (var i = 0; i < len; i++) {
        value = fn.apply(receiver, [sequence[i]]);
        if (!value) return value;
    }
    return value;
}

// Returns a function that returns true when +fn()+ returns false.
// == fn.not()(args...) == !fn(args...)
// :: (a -> boolean) -> (a -> boolean)
Functional.not = function(fn) {
    fn = Function.toFunction(fn);
    return function() {  
        return !fn.apply(null, arguments);
    }
}

// ^^ OO -> FP coercion functions

// Returns a function that takes an object as an argument, and applies
// +object+'s +methodName+ method to +arguments+.
// == fn(name)(object, args...) == object[name](args...)
// :: name args.. -> object args2... -> object[name](args... args2...)
Functional.invoke = function(methodName/*, arguments*/) {
    var args = [].slice.call(arguments, 1);
    return function(object) {
        return object[methodName].apply(object, [].slice.call(arguments, 1).concat(args));
    }
}

// Returns a function that takes an object, and returns the value of its
// +name+ property.  pluck(name) is the same as '_.name'.lambda().
// == fn.pluck(name)(object) == object[name]
// :: name -> object -> object[name]
Functional.pluck = function(name) {
    return function(object) {
        return object[name];
    }
}

// ^^ Control structure

// Returns a function that applies +fn+ to +v+ to a value +v+, and then
// applies +fn+ to the result, zero or more times, while +pred(v)+ is true.
// :: (a -> boolean) (a -> a) -> a
Functional.until = function(pred, fn) {
    fn = Function.toFunction(fn);
    pred = Function.toFunction(pred);
    return function(value) {
        while (!pred.call(null, value))
            value = fn.call(null, value);
        return value;
    }
}

// ^ String lambdas

// Turns a string that contains a Javascript expression, into a
// +Function+ that applies the expression.
// 
// If the string contains a '->', this separates the parameters from the body:
//   x, y -> x + y
//   x y -> x + y
// Otherwise, if the expression contains a '_', this is the parameter:
//   _ + 1
// Otherwise, each symbol is an implicit parameter:
//   x + y
// The implicit case won't do what you want if the expression contains
// symbols that aren't variables.  In that case,
// use '_' or '->' to specify the parameters explicitly:
//   Math.pow(_, 2)
//   x -> Math.pow(x, 2)
// 
// You can chain '->' to create a function in uncurried form:
//   x -> y -> x + y
String.prototype.lambda = function() {
    var params = [];
    var body = this;
    var sections = body.split(/\s*->\s*/);
    if (sections.length > 1) {
        while (sections.length) {
            body = sections.pop();
            params = sections.pop().split(/\s*,\s*|\s+/);
            sections.length && sections.push('(function('+params+'){return ('+body+')})');
        }
    } else if (body.match(/\b_\b/)) {
        params = '_';
    } else if (body.match(/^\s*[+*\/%&|^!\.=<>]/)) {
        params = '_';
        body = '_' + body;
    } else if (body.match(/[+\-*\/%&|^!\.=<>]\s*$/)) {
        params = '_';
        body = body + '_';
    } else {
        var vars = this.match(/([a-z_$][a-z_$\d]*)/gi);
        for (var i = 0, v; v = vars[i++]; )
            params.indexOf(v) >= 0 || params.push(v);
    }
    return new Function(params, 'return (' + body + ')');
}

// Coerce the string to a function and then apply it.
// >> 'x+1'.apply(null, [2]) -> 3
String.prototype.apply = function(thisArg, args) {
    return this.toFunction().apply(thisArg, args);
}

// Coerce the string to a function and then call it.
// >> 'x+1'.call(2) -> 3
String.prototype.call = function() {
    return this.toFunction().apply(arguments[0], [].slice.call(arguments, 1));
}

// ^^ Coercion

// Returns a Function that perfoms the action described by this
// string.  If the string contains a 'return', applies
// 'new Function' to it.  Otherwise, calls +lambda+.
String.prototype.toFunction = function() {
    var body = this;
    if (body.match(/\breturn\b/))
        return new Function(this);
    return this.lambda();
}

// Returns this function.  For use when an unknown value
// must be coerced to a function.
Function.prototype.toFunction = function() {
    return this;
}

// Coerces +fn+ into a function if it is not already one,
// by calling its +toFunction+ method.
Function.toFunction = function(value) {
    return value.toFunction();
}
