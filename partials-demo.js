/* Copyright 2007 by Oliver Steele.  This work is licensed under the
 * MIT license, and the Creative Commons Attribution-Noncommercial-Share
 * Alike 3.0 License. http://creativecommons.org/licenses/by-nc-sa/3.0/
 */

var info = console.info;

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
        {method: 'GET', onSuccess: compose(displayTestResults, pluck('responseText'))});
}

function unindent(lines) {
    var min = lines.grep(/\S/).map(function(line) {
        return line.match(/^\s*/)[0].length; 
    }).min();
    return lines.map(function(line) {
        return line.slice(min);
    });
}

function extractLines(string) {
    var lines = string.split('\n');
    var start = 1 + lines.indexOf(lines.grep(/function tests/)[0]);
    var segment = lines.slice(start);
    var end = start + segment.indexOf(segment.grep(/^\}/)[0]);
    return unindent(lines.slice(start, end)).map(function(line) {
        return line || ' ';
    }).join('\n');
}

function runTests(tests) {
    var s = info;
    var results = [];
    try {
        info = function() {
            results.push([].slice.call(arguments, 0).join(' '));
        }
        tests();
    } finally {
        info = s;
    }
    return results;
}

function displayTestResults(string) {
    var programLines = extractLines(string).escapeHTML().split('info(');
    var outputs = runTests(tests);
    var lines = [programLines.shift()];
    programLines.each(function(segment, ix) {
        var output = outputs[ix].escapeHTML();
        var m = segment.match(/'(.*)', /);
        if (m && m[1] == output.slice(0, m[1].length)) {
            segment = segment.slice(m[0].length);
            output = output.slice(m[1].length);
        }
        var m = segment.indexOf(');');
        lines.push(segment.slice(0, m));
        lines.push(';\n <span class="output">&rarr;');
        lines.push(output);
        lines.push('</span>');
        lines.push(segment.slice(m+2));
    });
    var html = lines.join('').replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    $('output').innerHTML = html;
}
