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

// The identity function: x -> x.
// :: x -> x
Function.I = function(x) {return x};

// Returns a constant function that returns +x+.
// :: x -> _ -> x
Function.K = function(x) {return function() {return x}}

// Returns a bound method on +object+; optionally currying +args+.
Function.prototype.bind = function(object/*, args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat([].slice.call(arguments, 0)));
    }
}

// a unique value that prints as '_', for use in +partial()+ (below)
var _ = new (function() {this.toString = function() {return '_'}});

// Returns a function +f2+ that applies the original function to a combination
// of +arguments+ and the arguments +args2+ to +f2+.  Where +arguments+ contains any
// value except +_+, this value is used.  Where +arguments+ contains a +_+, the
// next argument from the +args2+ is used.  If any values remain in +args2+
// once all the +_+ have been filled in, they are appended to the end of
// +arguments+.  Finally, the underlying function is applied to the modified
// +arguments+.
// If argument combination produces a list with any +_+, a new partial function
// is returned, and the underlying function is not invoked.
Function.prototype.partial = function(/*arguments*/) {
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

// Curry.  Returns a function that, applied to an argument list +arg2+,
// has the effect of applying the underlying function to +args+ + +arg2+.
// Adapted from http://www.coryhudson.com/blog/2007/03/10/javascript-currying-redux/
// :: f args... -> args2... -> f args... args2...
Function.prototype.curry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args.concat([].slice.call(arguments, 0)));
    };
}

// Curry on the right.  +args+ are concatenated to the right
// of the argument list that this function's return value is
// applied to.
// :: f args... -> args2... -> f args2... args...
Function.prototype.rcurry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, [].slice.call(arguments, 0).concat(args));
    };
}

// Same as curry, except only applies the function when all
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

// Same as rcurry, except only applies the function when all
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

// :: f args... -> args2... -> f args...
// Returns a function that ignores arguments.
Function.prototype.only = function() {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args);
    }
}

// Return a function that applied the last argument of this
// function to its input, and the penultimate argument to this,
// and so on.
// :: f1 f2 f3... fn -> args -> f1(f2(f3(...(fn(*args)))))
function compose(/*fn...*/) {
    var fns = [].slice.call(arguments, 0);
    return function() {
        for (var i = fns.length; --i >= 0; )
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

// Same as +compose+ only applies the functions from front to back.
// (Equivalent to compose(sequence, invoke('reverse')).)
// :: f1 f2 f3... fn -> args -> fn(...(f3(f2(f1(*args)))))
function sequence(/*fn...*/) {
    var fns = [].slice.call(arguments, 0);
    return function() {
        for (var i = 0; i < fns.length; i++)
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

// Returns a function that takes an object as an argument, and applies
// +object+'s +methodName+ method to +arguments+.
// :: name args.. -> object args2... -> object[name](args... args2...)
function invoke(methodName/*, arguments*/) {
    var args = [].slice.call(arguments, 1);
    return function(object) {
        return object[methodName].apply(object, [].slice.call(arguments, 1).concat(args));
    }
}

// Returns a function that takes an object, and returns the value of its
// +name+ property.
// :: name -> object -> object[name]
function pluck(name) {
    return function(object) {
        return object[name];
    }
}
