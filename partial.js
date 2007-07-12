/* Copyright 2007 by Oliver Steele.
 *
 * License: This work is licensed under the MIT license, and the
 * Creative Commons Attribution-Noncommercial-Share Alike 3.0 License
 * http://creativecommons.org/licenses/by-nc-sa/3.0/.
 * Take your pick.
 *
 * Source: http://osteele.com/javascripts/partial.js
 * Demo: http://osteele.com/javascripts/partials-demo.html
 *
 * This file defines some functionals for partial function application, as
 * well as some other utilities for functional programming.  It doesn't
 * include collection functions (map, reduce, each, select), since
 * most other libraries define them.
 */

/*
 * Agenda:
 * - test the outtakes from partials-demo.js
 * - rename -> partials.js
 * - wait until fully saturated?
 */

// id function: x -> x
Function.I = function(x) {return x};

// constant function: x -> _ -> x
Function.K = function(x) {return function() {return x}}

Function.prototype.bind = function(object/*, args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat([].slice.call(arguments, 0)));
    }
}

// a unique value that prints as '_', for use in partial()
var _ = new (function() {this.toString = function() {return '_'}});

// This does partials *and* currying.
Function.prototype.partial = function() {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    // substitution positions
    var subpos = [], value;
    for (var i = 0; i < arguments.length; i++)
        arguments[i] == _ && subpos.push(i);
    return function() {
        var specialized = args.concat([].slice.call(arguments, subpos.length));
        for (var i = 0; i < subpos.length; i++)
            specialized[subpos[i]] = arguments[i];
        return fn.apply(this, specialized);
    }
}

// f args... -> args2... -> f args... args2...
// adapted from http://www.coryhudson.com/blog/2007/03/10/javascript-currying-redux/
Function.prototype.curry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args.concat([].slice.call(arguments, 0)));
    };
}

// f args... -> args2... -> f args2... args...
Function.prototype.rcurry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, [].slice.call(arguments, 0).concat(args));
    };
}

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

// f args... -> args2... -> f args...
// Returns a function that ignores arguments.
Function.prototype.only = function() {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args);
    }
}

// f1 f2 f3... fn -> args -> f1(f2(f3(...(fn(*args)))))
function compose(/*fn...*/) {
    var fns = [].slice.call(arguments, 0);
    return function() {
        for (var i = fns.length; --i >= 0; )
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

// f1 f2 f3... fn -> args -> fn(...(f3(f2(f1(*args)))))
// same as compose(sequence, invoke('reverse'))
function sequence() {
    var fns = [].slice.call(arguments, 0);
    return function() {
        for (var i = 0; i < fns.length; i++)
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

// name args.. -> object args2... -> object[name](args... args2...)
function invoke(methodName) {
    var args = [].slice.call(arguments, 0);
    return function(object) {
        return object[methodName].apply(object, [].slice.call(arguments, 0).concat(args));
    }
}

// name -> object -> object[name]
function pluck(name) {
    return function(object) {
        return object[name];
    }
}
