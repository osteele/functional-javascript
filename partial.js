/* Agenda:
- fix
- curry
- rcurry
- bind
- partial
- move to separate file
*/

var info = console.info;

// gensym a unique value that prints as '_'
var _ = new (function() {this.toString = function() {return '_'}});

// This does partials *and* currying.  Invoke the result's +nocurry+
// method to create a function that turns off the latter.
Function.prototype.partial = function() {
    var fn = this;
    // substitution positions
    var subpos = [], value;
    for (var i = 0; i < arguments.length; i++)
        arguments[i] == _ && subpos.push(i);
    var args = [].slice.call(arguments, 0);
    return function() {
        var specialized = args.concat([].slice.call(arguments, subpos.length));
        for (var i = 0; i < subpos.length; i++)
            specialized[subpos[i]] = arguments[i];
        return fn.apply(this, specialized);
    }
}

// adapted from http://www.coryhudson.com/blog/2007/03/10/javascript-currying-redux/
Function.prototype.curry = function(/*args...*/) {
    var fn = this;
    var args = [].slice.call(arguments, 0);
    return function() {
        return fn.apply(this, args.concat([].slice.call(arguments, 0)));
    };
}

Function.prototype.nocurry = function() {
    var method = this;
    return function() {
        return method.apply(this, []);
    }
}

Function.prototype.specialize = function() {
    return this.partial.apply(this, arguments).nocurry();
}


// Tests

function f1(a,b,c,d) {return [a,b,c,d]};
var f2 = f1.partial(1,_,2);

info('f2 = _, ... -> [1, _, 2, _]');
info('f2 3 ->', f2(3));
info('f2 4, 5 ->', f2(4,5));

var f3 = f1.partial(1,2);
info('f3 = ... -> [1, 2, _, _]');
info('f3 4, 5 -> ', f3(4,5));

var replaceVowels = "".replace.partial(/[aeiou]/g, _);
var replaceWithCoronalFricatives = "".replace.partial(_, 'th');

info(replaceVowels.call("change my vowels to underscorees", '_'));
info(replaceWithCoronalFricatives.call("substitute my esses with tee-aitches", /s/g));

var onclick = Event.observe.bind(Event).partial(_, 'click');

Event.observe(window, 'load', initialize);

function initialize() {
    Event.observe('e1', 'click', function(){alert('1')});
    onclick('e2', function(){alert('2')});
    onclick('e3', alert.bind(null).specialize('3'));
}


/*
Partial Function Application in JavaScript

Here's a fun little function:
[insert from above]

Usage:
var replaceVowels(sub) = "".
*/