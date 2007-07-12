/* Copyright 2007 by Oliver Steele.  This work is licensed under the
 * MIT license, and the Creative Commons Attribution-Noncommercial-Share
 * Alike 3.0 License. http://creativecommons.org/licenses/by-nc-sa/3.0/
 */

var info = window.console && console.info || function(){};
var trace = info;

// Examples
function examples() {
    // Create an unspecialized function that just lists its (four) arguments.
    // We'll create partially applied (specialized) versions of this function
    // below.
    function list(a,b,c,d) {return [a,b,c,d]};

    // Specialize the first and third parameters.  This creates a new
    // function, that interleaves its arguments with the 1 and 2.
    var finterleave = list.partial(1,_,2,_);
    trace('f2 3 ->', finterleave(3, 4));

    // Specialize the outer two parameters, to produce a function that
    // plugs in the inners.
    var finners = list.partial(1,_,_,2);
    trace('f3 4, 5 -> ', finners(3, 4));
    
    // if not all the parameters are supplied, the result is a function...
    trace(finterleave(4));
    // ...which can be applied until the argument list is saturated.
    trace('f2 4, 5 ->', finterleave(3)(4));
    trace(finners(_,3));
    trace(finners(_,3)(4));
    trace(finners(3)(4));
    trace(list.partial(_,_,_,1)(2,_,3)(4));

    // An application: create some specialized versions of String replace.
    // The first function replaces vowels with its argument; the second
    // replaces spans that match its argument with 'th'.
    var replaceVowels = "".replace.partial(/[aeiou]/g, _);
    var replaceWithCoronalFricatives = "".replace.partial(_, 'th');
    // invoke methods with call() (could use bind() and then call normally)
    trace(replaceVowels.call("change my vowels to underscores", '_'));
    trace(replaceWithCoronalFricatives.call("substitute my esses with tee-aitches", /s/g));

    // curry creates a new function that applies the original arguments, and
    // then the new arguments
    var right = list.curry(1, 2);
    trace(right(3,4));
    var left = list.rcurry(1, 2);
    trace(left(3, 4));

    // use right curry to create 'halve' and 'double' functions from divide
    function divide(a, b) {return a/b}
    var halve = divide.rcurry(2);
    var double = divide.rcurry(1/2);
    trace('halve 10', halve(10));
    trace('double 10', double(10));
    
    // ncurry and rncurry wait until they're fully saturated before
    // applying the function.  [r]curry can't because it doesn't
    // know the polyadicity of the underlying function.
    trace(list.curry(1,2)(3));
    trace(list.ncurry(4,1,2)(3));
    trace(list.ncurry(4,1,2)(3)(4));
    trace(list.ncurry(4,1,2)(3,4));
    trace(list.rncurry(4,1,2)(3));
    trace(list.rncurry(4,1,2)(3,4));
    
    // Curry and partial overlap in their use, but curries are like Haskell sections
    // (10 /) 2
    trace(divide.curry(10)(2));
    // (/ 2) 10
    trace(divide.rcurry(2)(10));
    // while partials are like math function syntax
    // (10 / _) 2
    trace(divide.partial(10, _)(2));
    // (_ / 2) 10
    trace(divide.partial(_, 2)(10));
    
    // An application: use with Prototype to define an 'onclick' that abbreviates
    // Event.observe(_, 'click', ...)
    var onclick = Event.observe.bind(Event).partial(_, 'click');
    // These next three lines are equivalent, except they act on different elements.
    Event.observe('e1', 'click', function(){alert('1')});
    onclick('e2', function(){alert('2')});
    onclick('e3', alert.bind(null).only('3'));
    
    // Use lambda to create single-expression functions from strings.
    // If the expression contains a '_', that's the argument.
    // Otherwise, the symbols are the arguments, in the order
    // they occur.  (lambda's not smart about keywords, property names,
    // and symbols in strings.  Use -> to tell it about these, or
    // _ for a unary function.)
    var square = 'x*x'.lambda();
    trace(square(3));
    trace('_+1'.lambda()(2));
    trace('x+1'.lambda()(2));
    trace('x+2*y'.lambda()(2, 3));
    // Use -> to name the variables when the expression contains symbols
    // that aren't variables (e.g. Math.sin), or you want to bind the
    // arguments in a different order from their occurrence in the expression.
    trace('x, y -> x+2*y'.lambda()(2, 3));
    trace('y, x -> x+2*y'.lambda()(2, 3));
    // You can chain -> to create curried functions.
    trace('x -> y -> x+y'.lambda()(2));
    trace('x -> y -> x+y'.lambda()(2)(3));
    
    // The Functional namespace defines the functionals: map, reduce, select,
    // some, every.  Google will tell you all about these.
    trace(Functional.map(function(x){return x+1}, [1,2,3]));
    // Lambda is useful in conjunction with functionals.
    trace(Functional.map('_+1'.lambda(), [1,2,3]));
    // The functionals use lambda implicitly to convert strings in function
    // position into functions.
    trace(Functional.map('_+1', [1,2,3]));
    // Functional.install() imports the functionals into the global namespace,
    // so that we don't have to qualify them with Functional.* each time.
    Functional.install();
    trace(map('_+1', [1,2,3]));
    trace(map('_.length', 'here are some words'.split(' ')));
    trace(select('_>2', [1,2,3,4]));
    trace(reduce('2*x+y', 0, [1,0,1,0]));
    trace(some('_>2', [1,2,3,4]));
    trace(every('_>2', [1,2,3,4]));
    
    // compose() and sequence() compose sequences of functions
    // backwards and forwards, respectively
    trace(compose('_+1', '_*2')(1));
    trace(sequence('_+1', '_*2')(1));
    trace(compose('_+1', '_*2', '_.length')('a string'));
    trace(compose.apply(null, map('x -> y -> x*y+1', [2,3,4]))(1));
    trace(compose.apply(null, map('x -> y -> x+y', ['hemi', 'demi', 'semi']))('quaver'));
    trace(compose.apply(null, map('x -> y -> x+"-"+y', ['hemi', 'demi', 'semi']))('quaver'));
    trace(compose.apply(null, map('x -> y -> x+"("+y+")"', ['hemi', 'demi', 'semi']))('quaver'));
    // The last few could have been handled by reduce
    trace(reduce('x y -> y+x', 'quaver', ['hemi', 'demi', 'semi'].reverse()));
    trace(reduce.partial('x y -> y+x', _, ['hemi', 'demi', 'semi'].reverse())('quaver'));
    
    // pluck and invoke turn methods into functions
    trace(map(pluck('length'), ["a string", "another string"]));
    trace(map(invoke('toUpperCase'), ["a string", "another string"]));
    // We can use lambda instead.
    trace(map('_.length', ["a string", "another string"]));
    trace(map('_.toUpperCase()', ["a string", "another string"]));
}

Event.observe(window, 'load', initialize);

function initialize() {
    Functional.install();
    new Ajax.Request(
        $('output').innerHTML,
        {method: 'GET', onSuccess: 'displayTestResults(_.responseText)'.lambda()});
    new Ajax.Request(
        $('docs').innerHTML,
        {method: 'GET', onSuccess: compose(displayDocs, '_.responseText')});
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
    var start = 1 + lines.indexOf(lines.grep(/function examples/)[0]);
    var segment = lines.slice(start);
    var end = start + segment.indexOf(segment.grep(/^\}/)[0]);
    return unindent(lines.slice(start, end)).map(function(line) {
        return line || ' ';
    }).join('\n');
}

function runExamples(examples) {
    var saved = window.trace;
    var results = [];
    try {
        trace = function() {
            var args = $A(arguments).map(function(x) {
                switch (typeof(x)) {
                case 'function': return 'function';
                case 'string': return '"' + x + '"';
                default: return x;
                }
            });
            results.push(args.join(' '));
        }
        examples();
    } catch (e) {
        console.error(e);
    } finally {
        trace = saved;
    }
    return results;
}

function displayTestResults(string) {
    var programLines = extractLines(string).escapeHTML().split('trace(');
    var outputs = runExamples(examples);
    var lines = [programLines.shift()];
    programLines.each(function(segment, ix) {
        var output = outputs[ix].escapeHTML();
        var m = segment.match(/'(.*)', /);
        if (m && '"' + m[1] + '"' == output.slice(0, m[1].length+2)) {
            output = output.slice(m[1].length+2);
            segment = segment.slice(m[0].length);
        }
        var m = segment.indexOf(');');
        lines.push(segment.slice(0, m));
        lines.push(';\n <span class="output">&rarr; ');
        lines.push(output.strip());
        lines.push('</span>');
        lines.push(segment.slice(m+2));
    });
    var html = lines.join('').replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    $('output').innerHTML = html;
    done('examples');
}

function Doc() {
    this.target = this.params = null;
    this.lines = [];
}

Doc.prototype.addDescriptionLine = function(line) {
    var match;
    if (match = line.match(/^\s+(.*)/))
        line = '<span class="formatted">&nbsp;&nbsp;' + match[1] + '</span>';
    else if (line.match(/^\s*$/))
        line = '<div class="br"> </div>';
    else
        line = line.escapeHTML().replace(/\+([\w()_]+)\+/g, '<var>$1</var>').replace(/\*(\w+)\*/g, '<em>$1</em>');
    this.lines.push(line);
}

Doc.findRecords = function(text) {
    var records = [];
    var rec = null;
    text.split('\n').each(function(line) {
        var match;
        if (match = line.match(/^\/\/ (.*)/)) {
            line = match[1];
            rec || (rec = new Doc());
            if (match = line.match(/\s*::\s*(.*)/))
                rec.signature = match[1];
            else
                rec.addDescriptionLine(line);
        } else if (rec) {
            var name, params;
            if (match = line.match(/^((?:\w+\.)*\w+)\s*=\s*function\s*\((.*?)\)/)) {
                name = match[1];
                params = match[2];
            } else if ((match = line.match(/^function\s+(\w+)\s*\((.*?)\)/))) {
                name = match[1];
                params = match[2];
            } else if ((match = line.match(/^var\s+(\w+)\s+=/))) {
                name = match[1];
            } else {
                //info('no match', line);
                records.pop();
                return;
            }
            if (match = name.match(/(.*\.)(\w+)/)) {
                name = match[2];
                rec.target = match[1];
            }
            rec.name = name;
            rec.params = params && params.replace(/\/\*/g, '').replace(/\*\//g, '');
            records.push(rec);
            rec = null;
        }
    });
    return records;
}

Doc.prototype.toHTML = function() {
    var spans = [];
    var target = '';
    this.target && spans.push('<span class="target">' + this.target + '</span>');
    spans.push('<span class="fname">' + this.name + '</span>');
    this.params != null && spans.push('(<var>' + this.params + '</var>)');
    this.signature && spans.push('<div class="signature"><span class="label">Signature:</span> '+this.signature.escapeHTML()+'</div>');
    spans = spans.concat(['<div class="description">',this.lines.join('<br/>'), '</div>', '<br/>']);
    return spans.join('');
}

function displayDocs(string) {
    try {
        recs = Doc.findRecords(string);
        var lines = [];
        recs.each(function(rec) {
            lines.push(rec.toHTML());
        });
       $('docs').innerHTML = lines.join('\n');
    } catch (e) {
        console.error(e);
    }
    done('docs');
}

function done(name) {
    var me = arguments.callee;
    me[name] = true;
    if (me.docs && me.examples)
        $('noscript').hide();
}