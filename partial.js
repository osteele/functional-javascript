/* Copyright 2007 by Oliver Steele.  This work is licensed under the
 * MIT license, and the Creative Commons Attribution-Noncommercial-Share
 * Alike 3.0 License. http://creativecommons.org/licenses/by-nc-sa/3.0/
 */

// gensym a unique value that prints as '_'
var _ = new (function() {this.toString = function() {return '_'}});

Function.prototype.bind = function(object/*, args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat([].slice.call(arguments, 0)));
    }
}   

// This does partials *and* currying.  Invoke the result's +nocurry+
// method to create a function that turns off the latter.
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

// same as +partial+, but doesn't append additional arguments
Function.prototype.specialize = function() {
    return this.partial.apply(this, arguments).nonary();
}


// adapted from http://www.coryhudson.com/blog/2007/03/10/javascript-currying-redux/
Function.prototype.curry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args.concat([].slice.call(arguments, 0)));
    };
}

Function.prototype.rcurry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, [].slice.call(arguments, 0).concat(args));
    };
}

Function.prototype.nonary = function() {
    var method = this;
    return function() {
        return method.apply(this, []);
    }
}

function compose() {
    var fns = [].slice.call(arguments, 0);
    return function() {
        for (var i = fns.length; --i >= 0; )
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}

function pluck(name) {
    return function(object) {
        return object[name];
    }
}

function sequence() {
    var fns = [].slice.call(arguments, 0);
    return function() {
        for (var i = 0; i < fns.length; i++)
            arguments = [fns[i].apply(this, arguments)];
        return arguments[0];
    }
}
