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

// Record the current contents of Function.prototype, so that we
// can see what we've added later.
window.__functionalInitialState = (function() {
    var record = {};
    for (var name in Function.prototype)
        record[name] = Function.prototype[name];
    return record;
})();

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

// Returns a function that ignores any further arguments.
// :: (a... -> b) a... -> (... -> b)
// == fn.saturate(args...)(args2..) == fn(args...)
// >> Math.max.saturate(1, 2)(3, 4) -> 2
Function.prototype.saturate = function(/*args*/) {
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

// For each method that this file defined on Function.prototype,
// define a function on Functional that delegates to it.
Function.functionalMethods = (function() {
    var methods = {};
    for (var name in Function.prototype)
        if (Function.prototype[name] != window.__functionalInitialState[name])
            methods[name] = Function.prototype[name];
    return methods;
})();

delete window.__functionalInitialState;


// ^ Higher-order functions

// A namespace for higher-order functions.  In addition to the functions defined
// below, every method defined above on +Function+ is also available as a function
// in +Functional+, that coerces its first argument to a +Function+ and applies
// the remaining arguments to it.
// == curry(fn, args...) == fn.curry(args...)
// >> Functional.flip('a/b')(1, 2) -> 2
// >> Functional.curry('a/b', 1)(2) -> 0.5
var Functional = window.Functional || {};

// For each method that this file defined on Function.prototype,
// define a function on Functional that delegates to it.
(function() {
    for (var name in Function.functionalMethods)
        Functional[name] = (function(name) {
            var fn = Function.prototype[name];
            return function(object) {
                return fn.apply(Function.toFunction(object), [].slice.call(arguments, 1));
            }
        })(name);
})();

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


// ^ String lambdas

// Turns a string that contains a Javascript expression, into a
// +Function+ that applies the expression.
// 
// If the string contains a '->', this separates the parameters from the body:
// >> 'x -> x + 1'.lambda()(1) -> 2
// >> 'x y -> x + y'.lambda()(1, 2) -> 5
// >> 'x, y -> x + 2*y'.lambda()(1, 2) -> 5
// Otherwise, if the string contains a '_', this is the parameter:
// >> '_ + 1'.lambda()(1) -> 2
// Otherwise if the string begins or ends with an operator or relation,
// prepend or append a parameter:
// >> '/2'.lambda()(4) -> 2
// >> '2/'.lambda()(4) -> 0.5
// >> '/'.lambda()(2,4) -> 0.5
// Otherwise, each symbol is an implicit parameter:
// >> 'x + 1'.lambda()() -> 2
// >> 'x + 2*y'.lambda()(1, 2) -> 5
// >> 'y + 2*x'.lambda()(1, 2) -> 5
// 
// The implicit case won't do what you want if the expression contains
// symbols that aren't variables.  In that case, use '_' or '->' to specify
// the parameters explicitly:
// >> 'Math.pow(_, 2)'.lambda()(3) -> 9
// >> 'x -> Math.pow(x, 2)'.lambda()(3) -> 9
// 
// Chain '->'s to create a function in uncurried form:
// >> 'x -> y -> x + 2*y'.lambda()(1)(2) -> 5
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
    } else {
        var m1 = body.match(/^\s*[+*\/%&|^!\.=<>]/);
        var m2 = body.match(/[+\-*\/%&|^!\.=<>]\s*$/);
        if (m1 || m2) {
            if (m1) {
                params.push('$1');
                body = '$1' + body;
            }
            if (m2) {
                params.push('$2');
                body = body + '$2';
            }
        } else {
            var vars = this.match(/([a-z_$][a-z_$\d]*)/gi);
            for (var i = 0, v; v = vars[i++]; )
                params.indexOf(v) >= 0 || params.push(v);
        }
    }
    return new Function(params, 'return (' + body + ')');
}

// ^^ Duck-Typing

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
