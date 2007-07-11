/* Agenda:
- curry
- rcurry
- bind
- partial
- move to separate file
*/

var info = console.info;

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

Function.prototype.specialize = function() {
    return this.partial.apply(this, arguments).nonary();
}


// Tests
function tests() {
    // create an unspecialized function that just lists its (four) arguments
    function list(a,b,c,d) {return [a,b,c,d]};

    // specialize the first and third parameters
    var f2 = list.partial(1,_,2);
    info('f2 3 ->', f2(3));
    info('f2 4, 5 ->', f2(4,5));

    // specialize the first two parameters (same as currying)
    var f3 = list.partial(1,2);
    info('f3 4, 5 -> ', f3(4,5));

    // create some specialized versions of String replace
    var replaceVowels = "".replace.partial(/[aeiou]/g, _);
    var replaceWithCoronalFricatives = "".replace.partial(_, 'th');
    // have to use call, since we're binding it to a different object
    info(replaceVowels.call("change my vowels to underscorees", '_'));
    info(replaceWithCoronalFricatives.call("substitute my esses with tee-aitches", /s/g));

    // use left and right curry to create 'halve' and 'double' functions
    function divide(a, b) {return a/b}
    var halve = divide.curry(2); // = (/ 2)
    var double = divide.curry(1/2);
    info('halve 10', halve(10));
    info('double 10', double(10));

    info(divide.curry(10)(2));  // = (10 /) 2
    info(divide.rcurry(2)(10)); // = (/ 2) 10
    
    // Use with Prototype to define an 'onclick' that abbreviates
    // Event.observe(_, 'click', ...)
    var onclick = Event.observe.bind(Event).partial(_, 'click');
    Event.observe('e1', 'click', function(){alert('1')});
    onclick('e2', function(){alert('2')});
    onclick('e3', alert.bind(null).specialize('3'));
}

Event.observe(window, 'load', initialize);

function initialize() {
    new Ajax.Request(
        $('src').src,
        {method: 'GET', onSuccess: compose(resp, pluck('responseText'))});
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

function unindent(lines) {
    var min = lines.grep(/\S/).map(function(line) {
        return line.match(/^\s*/)[0].length; 
    }).min();
    return lines.map(function(line) {
        return line.slice(min);
    });
}

function extract(t) {
    var lines = t.split('\n');
    var start = 1 + lines.indexOf(lines.grep(/function tests/)[0]);
    var segment = lines.slice(start);
    var end = start + segment.indexOf(segment.grep(/^\}/)[0]);
    return unindent(lines.slice(start, end)).map(function(line) {
        return line || ' ';
    }).join('\n');
}

function resp(t) {
    //info(extract(t));
    var s = info;
    var outputs = [];
    try {
        info = function() {outputs.push([].slice.call(arguments, 0).join(' '))}
        tests();
    } finally {
        info = s;
    }
    v1 = extract(t).escapeHTML().split('info(');
    //info(v1, outputs);
    var j = [v1.shift()];
    v1.each(function(segment, ix) {
        var output = outputs[ix].escapeHTML();
        var m = segment.match(/'(.*)', /);
        if (m && m[1] == output.slice(0, m[1].length)) {
            segment = segment.slice(m[0].length);
            output = output.slice(m[1].length);
        }
        var m = segment.indexOf(');');
        j.push(segment.slice(0, m));
        j.push(';\n <span class="output">&rarr;');
        j.push(output);
        j.push('</span>');
        j.push(segment.slice(m+2));
    });
    $('output').innerHTML = j.join('').replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
}


/*
Partial Function Application in JavaScript

Here's a fun little function:
[insert from above]

Usage:
var replaceVowels(sub) = "".
*/