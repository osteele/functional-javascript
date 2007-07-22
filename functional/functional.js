/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Source: http://osteele.com/javascripts/functional/functional.js
 * Created: 2007-07-11
 * Version: 1.0; modified 2007-07-15
 *
 * This file defines some higher-order functions for partial function
 * application, as well as some other utilities for functional programming.
 * It also defines methods that allow a string such as 'x+1' or
 * 'x -> x+1' to be used as though it were a function.
 */


/// This defines the namespace for higher-order functions.
var Functional = window.Functional || {};

/**
 * Copies all the public functions in `Functional`, except this function
 * and the functions named in the optional hash `except`, into the global
 * namespace.
 * >> Functional.install()
 */
Functional.install = function(except) {
    var source = Functional,
        target = window;
    for (var name in source)
        name == 'install'
        || name.charAt(0) == '_'
        || except && name in except
        || {}[name] // work around Prototype
        || (target[name] = source[name]);
}

/// ^ Higher-order functions

/**
 * Returns a function that applies the last argument of this
 * function to its input, and the penultimate argument to the
 * result of the application, and so on.
 * == compose(f1, f2, f3..., fn)(args) == f1(f2(f3(...(fn(args...)))))
 * :: (a2 -> a1) (a3 -> a2)... (a... -> a_{n}) -> a... -> a1
 * >> compose('1+', '2*')(2) -> 5
 */
Functional.compose = function(/*fn...*/) {
    var fns = Functional.map(Function.toFunction, arguments);
    return function() {
        for (var i = fns.length; --i >= 0; )
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

/**
 * Same as `compose`, except applies the functions in argument-list order.
 * == sequence(f1, f2, f3..., fn)(args...) == fn(...(f3(f2(f1(args...)))))
 * :: (a... -> a1) (a1 -> a2) (a2 -> a3)... (a_{n-1} -> a_{n})  -> a... -> a_{n}
 * >> sequence('1+', '2*')(2) -> 6
 */
Functional.sequence = function(/*fn...*/) {
    var fns = Functional.map(Function.toFunction, arguments);
    return function() {
        for (var i = 0; i < fns.length; i++)
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

/**
 * Applies `fn` to each element of `sequence`.
 * == map(f, [x1, x2...]) = [f(x, 0), f(x2, 1), ...]
 * :: (a ix -> boolean) [a] -> [a]
 * >> map('1+', [1,2,3]) -> [2, 3, 4]
 * The fusion rule:
 * >> map('+1', map('*2', [1,2,3])) -> [3, 5, 7]
 * >> map(compose('+1', '*2'), [1,2,3]) -> [3, 5, 7]
 */
Functional.map = function(fn, sequence, object) {
    fn = Function.toFunction(fn);
    var len = sequence.length,
        result = new Array(len);
    for (var i = 0; i < len; i++)
        result[i] = fn.apply(object, [sequence[i], i]);
    return result;
}

/**
 * Applies `fn` to `init` and the first element of `sequence`,
 * and then to the result and the second element, and so on.
 * == reduce(f, init, [x0, x1, x2]) == f(f(f(init, x0), x1), x2)
 * :: (a b -> a) a [b] -> a
 * >> reduce('x y -> 2*x+y', 0, [1,0,1,0]) -> 10
 */
Functional.reduce = function(fn, init, sequence, object) {
    fn = Function.toFunction(fn);
    var len = sequence.length,
        result = init;
    for (var i = 0; i < len; i++)
        result = fn.apply(object, [result, sequence[i]]);
    return result;
}

/**
 * Returns a list of those elements $x$ of `sequence` such that
 * $fn(x)$ returns true.
 * :: (a -> boolean) [a] -> [a]
 * >> select('%2', [1,2,3,4]) -> [1, 3]
 */
Functional.select = function(fn, sequence, object) {
    fn = Function.toFunction(fn);
    var len = sequence.length,
        result = [];
    for (var i = 0; i < len; i++) {
        var x = sequence[i];
        fn.apply(object, [x, i]) && result.push(x);
    }
    return result;
}

/// A synonym for `select`.
Functional.filter = Functional.select;

/// A synonym for `reduce`.
Functional.foldl = Functional.reduce;

/**
 * Same as `foldl`, but applies the function from right to left.
 * == foldr(f, init, [x0, x1, x2]) == fn(x0, f(x1, f(x2, init)))
 * :: (a b -> b) b [a] -> b
 * >> foldr('x y -> 2*x+y', 100, [1,0,1,0]) -> 104
 */
Functional.foldr = function(fn, init, sequence, object) {
    fn = Function.toFunction(fn);
    var len = sequence.length,
        result = init;
    for (var i = len; --i >= 0; )
        result = fn.apply(object, [sequence[i], result]);
    return result;
}

/// ^^ Predicates

/**
 * Returns a function that returns `true` when all the arguments, applied
 * to the returned function's arguments, returns true.
 * == and(f1, f2...)(args...) == f1(args...) && f2(args...)...
 * :: [a -> boolean] a -> a
 * >> and('>1', '>2')(2) -> false
 * >> and('>1', '>2')(3) -> true
 * >> and('>1', 'error()')(1) -> false
 */
function and() {
    var args = map(Function.toFunction, arguments),
        arglen = args.length;
    return function() {
        var value = true;
        for (var i = 0; i < arglen; i++)
            if (!(value = args[i].apply(this, arguments)))
                break;
        return value;
    }
}

/**
 * Returns a function that returns `true` when any argument, applied
 * to the returned function's arguments, returns true.
 * == or(f1, f2...)(args...) == f1(args...) || f2(args...)...
 * :: [a -> boolean] a -> a
 * >> or('>1', '>2')(1) -> false
 * >> or('>1', '>2')(2) -> true
 * >> or('>1', 'error()')(2) -> true
 */
function or() {
    var args = map(Function.toFunction, arguments),
        arglen = args.length;
    return function() {
        var value = false;
        for (var i = 0; i < arglen; i++)
            if ((value = args[i].apply(this, arguments)))
                break;
        return value;
    }
}

/**
 * Returns true when `$fn(x)$ returns true for some element $x$ of
 * `sequence`.
 * == some(fn, [x1, x2, x3]) == fn(x1) || fn(x2) || fn(x3)
 * :: (a -> boolean) [a] -> boolean
 * >> some('>2', [1,2,3]) -> true
 * >> some('>10', [1,2,3]) -> false
 */
Functional.some = function(fn, sequence, object) {
    fn = Function.toFunction(fn);
    var len = sequence.length,
        value = false;
    for (var i = 0; i < len; i++)
        if ((value = fn.call(object, sequence[i])))
            break;
    return value;
}

/**
 * Returns true when $fn(x)$ is true for every element $x$ of
 * `sequence`.
 * == every(fn, [x1, x2, x3]) == fn(x1) && fn(x2) && fn(x3)
 * :: (a -> boolean) [a] -> boolean
 * >> every('<2', [1,2,3]) -> false
 * >> every('<10', [1,2,3]) -> true
 */
Functional.every = function(fn, sequence, object) {
    fn = Function.toFunction(fn);
    var len = sequence.length,
        value = true;
    for (var i = 0; i < len; i++)
        if (!(value = fn.call(object, sequence[i])))
            break;
    return value;
}

/**
 * Returns a function that returns `true` when $fn()$ returns false.
 * == fn.not()(args...) == !fn(args...)
 * :: (a -> boolean) -> (a -> boolean)
 * >> not(Functional.K(true))() -> false
 * >> not(Functional.K(false))() -> true
 */
Functional.not = function(fn) {
    fn = Function.toFunction(fn);
    return function() {  
        return !fn.apply(null, arguments);
    }
}


/// ^^ Utilities

/**
 * Returns a function that takes an object as an argument, and applies
 * `object`'s `methodName` method to `arguments`.
 * == fn(name)(object, args...) == object[name](args...)
 * :: name args... -> object args2... -> object[name](args... args2...)
 * >> invoke('toString')(123) -> "123"
 */
Functional.invoke = function(methodName/*, arguments*/) {
    var args = [].slice.call(arguments, 1);
    return function(object) {
        return object[methodName].apply(object, [].slice.call(arguments, 1).concat(args));
    }
}

/**
 * Returns a function that takes an object, and returns the value of its
 * `name` property.  `pluck(name)` is equivalent to `'_.name'.lambda()`.
 * == fn.pluck(name)(object) == object[name]
 * :: name -> object -> object[name]
 * >> pluck('length')("abc") -> 3
 */
Functional.pluck = function(name) {
    return function(object) {
        return object[name];
    }
}

/**
 * Returns a function that, while $pred(value)$ is true, applies `fn` to
 * $value$ to produce a new value, which is used as an input for the next round.
 * The returned function returns the first $value$ for which $pred(value)$
 * is false.
 * :: (a -> boolean) (a -> a) -> a
 * >> until('>10', '2*')(1) -> 16
 */
Functional.until = function(pred, fn) {
    fn = Function.toFunction(fn);
    pred = Function.toFunction(pred);
    return function(value) {
        while (!pred.call(null, value))
            value = fn.call(null, value);
        return value;
    }
}

/**
 * :: [a] [b]... -> [[a b]...]
 * == zip(a, b...) == [[a0, b0], [a1, b1], ...]
 * Did you know that `zip` can transpose a matrix?:
 * >> zip.apply(null, [[1,2],[3,4]]) -> [[1, 3], [2, 4]]
 */
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

// For each method that this file defined on `Function.prototype`,
// define a function on `Functional` that delegates to it.
Functional._attachMethodDelegates = function(methods) {
    for (var name in methods)
        Functional[name] = Functional[name] || (function(name) {
            var fn = methods[name];
            return function(object) {
                return fn.apply(Function.toFunction(object), [].slice.call(arguments, 1));
            }
        })(name);
}

// Record the current contents of `Function.prototype`, so that we
// can see what we've added later.
Functional.__initalFunctionState = Functional._startRecordingMethodChanges(Function.prototype);

/// ^ Higher-order methods

/// ^^ Partial function application

/**
 * Returns a bound method on `object`; optionally currying `args`.
 * == fn.bind(obj, args...)(args2...) == fn.apply(obj, [args..., args2...])
 */
Function.prototype.bind = function(object/*, args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat([].slice.call(arguments, 0)));
    }
}

/**
 * Returns a function that applies the underlying function to `args`, and
 * ignores its own arguments.
 * :: (a... -> b) a... -> (... -> b)
 * == fn.saturate(args...)(args2...) == fn(args...)
 * >> Math.max.curry(1, 2)(3, 4) -> 4
 * >> Math.max.saturate(1, 2)(3, 4) -> 2
 * >> Math.max.curry(1, 2).saturate()(3, 4) -> 2
 */
Function.prototype.saturate = function(/*args*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args);
    }
}

/**
 * Invoking the function returned by this function only passes `n`
 * arguments to the underlying function.  If the underlying function
 * is not saturated, the result is a function that passes all its
 * arguments to the underlying function.  (That is, `aritize` only
 * affects its immediate caller, and not subsequent calls.)
 * >> '[a,b]'.lambda()(1,2) -> [1, 2]
 * >> '[a,b]'.lambda().aritize(1)(1,2) -> [1, undefined]
 * >> '+'.lambda()(1,2)(3) -> error
 * >> '+'.lambda().ncurry(2).aritize(1)(1,2)(3) -> 4
 * 
 * `aritize` is useful to remove optional arguments from a function that is passed
 * to a higher-order function that supplies *different* optional arguments.
 * For example, many implementations of `map` and other collection
 * functions call the function argument with both the collection element
 * and its position.  This is convenient when expected, but can wreak
 * havoc when the function argument is a curried function that expects
 * a single argument from `map` and the remaining arguments from when
 * the result of `map` is applied.
 */
Function.prototype.aritize = function(n) {
    var fn = this;
    return function() {
        return fn.apply(this, [].slice.call(arguments, 0, n));
    }
}

/**
 * Returns a function that, applied to an argument list $arg2$,
 * applies the underlying function to $args ++ arg2$.
 * :: (a... b... -> c) a... -> (b... -> c)
 * == fn.curry(args...)(args2...) == fn(args..., args2...)
 * 
 * Note that, unlike in languages with true partial application such as Haskell,
 * `curry` and `uncurry` are not inverses.  This is a repercussion of the
 * fact that in JavaScript, unlike Haskell, a fully saturated function is
 * not equivalent to the value that it returns.  The definition of `curry`
 * here matches semantics that most people have used when implementing curry
 * for procedural languages.
 * 
 * This implementation is adapted from
 * [http://www.coryhudson.com/blog/2007/03/10/javascript-currying-redux/].
 */
Function.prototype.curry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args.concat([].slice.call(arguments, 0)));
    };
}

/*
 * Right curry.  Returns a function that, applied to an argument list $args2$,
 * applies the underlying function to $args2 + args$.
 * == fn.curry(args...)(args2...) == fn(args2..., args...)
 * :: (a... b... -> c) b... -> (a... -> c)
 */
Function.prototype.rcurry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, [].slice.call(arguments, 0).concat(args));
    };
}

/**
 * Same as `curry`, except only applies the function when all
 * `n` arguments are saturated.
 */
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

/**
 * Same as `rcurry`, except only applies the function when all
 * `n` arguments are saturated.
 */
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

/**
 * `_` (underscore) is bound to a unique value for use in `partial`, below.
 * This is a global variable, but it's also a property of `Function` in case
 * you overwrite or bind over the global one.
 */
_ = Function._ = {};

/**
 * Returns a function $f$ such that $f(args2)$ is equivalent to
 * the underlying function applied to a combination of $args$ and $args2$.
 * 
 * `args` is a partially-specified argument: it's a list with "holes",
 * specified by the special value `_`.  It is combined with $args2$ as
 * follows:
 * 
 * From left to right, each value in $args2$ fills in the leftmost
 * remaining hole in `args`.  Any remaining values
 * in $args2$ are appended to the result of the filling-in process
 * to produce the combined argument list.
 * 
 * If the combined argument list contains any occurrences of `_`, the result
 * of the application of $f$ is another partial function.  Otherwise, the
 * result is the same as the result of applying the underlying function to
 * the combined argument list.
 */
Function.prototype.partial = function(/*args*/) {
    var fn = this;
    var _ = Function._;
    var args = [].slice.call(arguments, 0);
    //substitution positions
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

/// ^^ Combinators

/// ^^^ Combinator Functions

/**
 * The identity function: $x -> x$.
 * == I(x) == x
 * == I == 'x'.lambda()
 * :: a -> a
 * >> Functional.I(1) -> 1
 */
Functional.I = function(x) {return x};

/**
 * Returns a "constant function" that returns `x`.
 * == K(x)(y) == x
 * == K(1) == '->1'.lambda()
 * :: a -> b -> a
 * >> Functional.K(1)(2) -> 1
 */
Functional.K = function(x) {return function() {return x}};

/// A synonym for `Functional.I`
Functional.id = Functional.I;

/// A synonym for `Functional.K`
Functional.constfn = Functional.K;


/**
 * Returns a function that applies the first function to the
 * result of the second, but passes all its arguments too.
 * == S(f, g)(args...) == f(g(args...), args...)
 * 
 * This is useful to compose functions when each needs access
 * to the arguments to the composed function.  For example,
 * the following function multiples its last two arguments,
 * and adds the first to that.
 * >> Function.S('+', '_ a b -> a*b')(2,3,4) -> 14
 * 
 * Curry this to get a version that takes its arguments in
 * separate calls:
 * >> Function.S.curry('+')('_ a b -> a*b')(2,3,4) -> 14
 */
Function.S = function(f, g) {
    f = Function.toFunction(f);
    g = Function.toFunction(g);
    return function() {
        return f.apply(this, [g.apply(this, arguments)].concat([].slice.call(arguments, 0)));
    }
}

/// ^^^ Combinator methods

/**
 * Returns a function that swaps its first two arguments before
 * passing them to the underlying function.
 * == fn.flip()(a, b, c...) == fn(b, a, c...)
 * :: (a b c...) -> (b a c...)
 * >> ('a/b'.lambda()).flip()(1,2) -> 2
 */
Function.prototype.flip = function() {
    var fn = this;
    return function() {
        var args = [].slice.call(arguments, 0);
        args = args.slice(1,2).concat(args.slice(0,1)).concat(args.slice(2));
        return fn.apply(this, args);
    }
}

/**
 * Returns a function that applies the underlying function to its
 * first argument, and the result of that application to the remaining
 * arguments.
 * == fn.uncurry(a, b...) == fn(a)(b...)
 * :: (a -> b -> c) -> (a, b) -> c
 * >> ('a -> b -> a/b'.lambda()).uncurry()(1,2) -> 0.5
 * 
 * Note that `uncurry` is *not* the inverse of `curry`.
 */
Function.prototype.uncurry = function() {
    var fn = this;
    return function() {
        var f1 = fn.apply(this, [].slice.call(arguments, 0, 1));
        return f1.apply(this, [].slice.call(arguments, 1));
    }
}

/**
 * ^^ Filtering
 * 
 * Filters intercept a value before it is passed to a function, and apply the
 * underlying function to the modified value.
 */

/**
 * `prefilterObject` returns a function that applies the underlying function
 * to the same arguments, but to an object that is the result of appyling
 * `filter` to the invocation object.
 * == fn.prefilterObject(filter).apply(object, args...) == fn.apply(filter(object), args...)
 * == fn.bind(object) == compose(fn.prefilterObject, Functional.K(object))
 * >> 'this'.lambda().prefilterObject('n+1').apply(1) -> 2
 */
Function.prototype.prefilterObject = function(filter) {
    filter = Function.toFunction(filter);
    var fn = this;
    return function() {
        return fn.apply(filter(this), arguments);
    }
}

/**
 * `prefilterAt` returns a function that applies the underlying function
 * to a copy of the arguments, where the `index`th argument has been
 * replaced by the value of `filter(argument[index])`.
 * == fn.prefilterAt(i, filter)(a1, a2, ..., a_{n}) == fn(a1, a2, ..., filter(a_{i}), ..., a_{n})
 * >> '[a,b,c]'.lambda().prefilterAt(1, '2*')(2,3,4) -> [2, 6, 4]
 */
Function.prototype.prefilterAt = function(index, filter) {
    filter = Function.toFunction(filter);
    var fn = this;
    return function() {
        var args = [].slice.call(arguments, 0);
        args[index] = filter.call(this, args[index]);
        return fn.apply(this, args);
    }
}

/**
 * `prefilterSlice` returns a function that applies the underlying function
 * to a copy of the arguments, where the arguments `start` through
 * `end` have been replaced by the value of `filter(argument.slice(start,end))`,
 * which must return a list.
 * == fn.prefilterSlice(i0, i1, filter)(a1, a2, ..., a_{n}) == fn(a1, a2, ..., filter(args_{i0}, ..., args_{i1}), ..., a_{n})
 * >> '[a,b,c]'.lambda().prefilterSlice('[a+b]', 1, 3)(1,2,3,4) -> [1, 5, 4]
 * >> '[a,b]'.lambda().prefilterSlice('[a+b]', 1)(1,2,3) -> [1, 5]
 * >> '[a]'.lambda().prefilterSlice(compose('[_]', Math.max))(1,2,3) -> [3]
 */
Function.prototype.prefilterSlice = function(filter, start, end) {
    filter = Function.toFunction(filter);
    start = start || 0;
    var fn = this;
    return function() {
        var args = [].slice.call(arguments, 0);
        var e = end < 0 ? args.length + end : end || args.length;
        args.splice.apply(args, [start, (e||args.length)-start].concat(filter.apply(this, args.slice(start, e))));
        return fn.apply(this, args);
    }
}

/// ^^ Method Composition

/**
 * `compose` returns a function that applies the underlying function
 * to the result of the application of `fn`.
 * == f.compose(g)(args...) == f(g(args...))
 * >> '1+'.lambda().compose('2*')(3) -> 7
 * 
 * Note that, unlike `Functional.compose`, the `compose` method on
 * function only takes a single argument.
 * == Functional.compose(f, g) == f.compose(g)
 * == Functional.compose(f, g, h) == f.compose(g).compose(h)
 */
Function.prototype.compose = function(fn) {
    var self = this;
    fn = Function.toFunction(fn);
    return function() {
        return self.apply(this, [fn.apply(this, arguments)]);
    }
}

/**
 * `sequence` returns a function that applies the underlying function
 * to the result of the application of `fn`.
 * == f.sequence(g)(args...) == g(f(args...))
 * == f.sequence(g) == g.compose(f)
 * >> '1+'.lambda().sequence('2*')(3) -> 8
 * 
 * Note that, unlike `Functional.compose`, the `sequence` method on
 * function only takes a single argument.
 * == Functional.sequence(f, g) == f.sequence(g)
 * == Functional.sequence(f, g, h) == f.sequence(g).sequence(h)
 */
Function.prototype.sequence = function(fn) {
    var self = this;
    fn = Function.toFunction(fn);
    return function() {
        return fn.apply(this, [self.apply(this, arguments)]);
    }
}

/**
 * Returns a function that is equivalent to the underlying function when
 * `guard` returns true, and otherwise is equivalent to the application
 * of `otherwise` to the same arguments.
 * 
 * `guard` and `otherwise` default to `Functional.I`.  `guard` with
 * no arguments therefore returns a function that applies the
 * underlying function to its value only if the value is true,
 * and returns the value otherwise.
 * == f.guard(g, h)(args...) == f(args...), when g(args...) is true
 * == f.guard(g ,h)(args...) == h(args...), when g(args...) is false
 * >> '[_]'.lambda().guard()(1) -> [1]
 * >> '[_]'.lambda().guard()(null) -> null
 * >> '[_]'.lambda().guard(null, Functional.K('n/a'))(null) -> "n/a"
 * >> 'x+1'.lambda().guard('<10', Functional.K(null))(1) -> 2
 * >> 'x+1'.lambda().guard('<10', Functional.K(null))(10) -> null
 * >> '/'.lambda().guard('p q -> q', Functional.K('n/a'))(1, 2) -> 0.5
 * >> '/'.lambda().guard('p q -> q', Functional.K('n/a'))(1, 0) -> "n/a"
 * >> '/'.lambda().guard('p q -> q', '-> "n/a"')(1, 0) -> "n/a"
 */
Function.prototype.guard = function(guard, otherwise) {
    var fn = this;
    guard = Function.toFunction(guard || Functional.I);
    otherwise = Function.toFunction(otherwise || Functional.I);
    return function() {
        return (guard.apply(this, arguments) ? fn : otherwise).apply(this, arguments);
    }
}

/// ^^ Utilities

/**
 * Returns a function identical to this function except that
 * it prints its arguments on entry and its return value on exit.
 * This is useful for debugging function-level programs.
 */
Function.prototype.traced = function(name) {
    var self = this;
    name = name || self;
    return function() {
        window.console && console.info('[', name, 'apply(', this!=window && this, ',', arguments, ')');
        var result = self.apply(this, arguments);
        window.console && console.info(']', name, ' -> ', result);
        return result;
    }
}


/**
 * ^^ Function methods as functions
 * 
 * In addition to the functions defined above, every method defined
 * on `Function` is also available as a function in `Functional`, that
 * coerces its first argument to a `Function` and applies
 * the remaining arguments to this.
 * 
 * A few examples make this clearer:
 * == curry(fn, args...) == fn.curry(args...)
 * >> Functional.flip('a/b')(1, 2) -> 2
 * >> Functional.curry('a/b', 1)(2) -> 0.5

 * For each method that this file defined on Function.prototype,
 * define a function on Functional that delegates to it.
 */
Functional._attachMethodDelegates(Functional.__initalFunctionState.getChangedMethods());
delete Functional.__initalFunctionState;


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
 * Implicit parameter detection looks inside regular expression literals for
 * variable names.  It doesn't know to ignore JavaScript keywords and bound variables.
 * (The only way you can get these last two if with a function literal inside the
 * string.  This is outside the use case for string lambdas.)
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
    var params = [];
    var expr = this;
    var sections = expr.ECMAsplit(/\s*->\s*/m);
    if (sections.length > 1) {
        while (sections.length) {
            expr = sections.pop();
            params = sections.pop().split(/\s*,\s*|\s+/m);
            sections.length && sections.push('(function('+params+'){return ('+expr+')})');
        }
    } else if (expr.match(/\b_\b/)) {
        params = '_';
    } else {
        var leftSection = expr.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m);
        var rightSection = expr.match(/[+\-*\/%&|\^\.=<>!]\s*$/m);
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
            var vars = this.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '').match(/([a-z_$][a-z_$\d]*)/gi) || []; // '
            for (var i = 0, v; v = vars[i++]; )
                params.indexOf(v) >= 0 || params.push(v);
        }
    }
    return new Function(params, 'return (' + expr + ')');
}

// IE6 split is not ECMAScript-compliant.  This breaks '->1'.lambda().
// The test is from the ECMAScript reference.
String.prototype.ECMAsplit =
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
         re.lastIndex = savedIndex;
         return result;
     });


/**
 * ^^ Duck-Typing
 * 
 * Strings support `call` and `apply`.  This duck-types them as
 * functions, to some callers.
 */

/*
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
    return this.toFunction().apply(arguments[0], [].slice.call(arguments, 1));
}

/// ^^ Coercion 

/**
 * Returns a `Function` that perfoms the action described by this
 * string.  If the string contains a `return`, applies
 * `new Function` to it.  Otherwise, calls `lambda`.
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
 * synthesized via `guard`:
 * >> Function.toFunction.guard()('1+') -> function()
 * >> Function.toFunction.guard()(null) -> null
 * 
 * `Function.toFunction` doesn't coerce arbitrary values to functions.
 * It might seem convenient to treat
 * Function.toFunction(value) as though it were the
 * constant function that returned `value`, but it's rarely
 * useful and it hides errors.  Use `Functional.K(value)` instead,
 * or a lambda string when the value is a compile-time literal:
 * >> Functional.K('a string')() -> "a string"
 * >> Function.toFunction('"a string"')() -> "a string"
 */
Function.toFunction = function(value) {
    return value.toFunction();
}
