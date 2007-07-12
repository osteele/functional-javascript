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
    // The first function replaces vowels with its argument:
    var replaceVowels = "".replace.partial(/[aeiou]/g, _);
    // This is a method, so use +call+ to invoke it:
    trace(replaceVowels.call("change my vowels to underscores", '_'));
    // The second function replaces spans that match its argument with 'th'.
    var replaceWithCoronalFricatives = "".replace.partial(_, 'th');
    trace(replaceWithCoronalFricatives.call("substitute my esses with tee-aitches", /s/g));

    // +curry+ creates a new function that applies the original arguments, and
    // then the new arguments
    var right = list.curry(1, 2);
    trace(right(3,4));
    var left = list.rcurry(1, 2);
    trace(left(3, 4));

    // use +rcurry+ ("right curry") to create +halve+ and +double+ functions from +divide+
    function divide(a, b) {return a/b}
    var halve = divide.rcurry(2);
    var double = divide.rcurry(1/2);
    trace('halve 10', halve(10));
    trace('double 10', double(10));
    
    // +ncurry+ and +rncurry+ wait until they're fully saturated before
    // applying the function.  [r]curry can't because it doesn't
    // in general know the polyadicity of the underlying function.
    trace(list.curry(1,2)(3));
    trace(list.ncurry(4,1,2)(3));
    trace(list.ncurry(4,1,2)(3)(4));
    trace(list.ncurry(4,1,2)(3,4));
    trace(list.rncurry(4,1,2)(3));
    trace(list.rncurry(4,1,2)(3,4));
    
    // +curry+ and +partial+ overlap in their use, but curries are like Haskell sections:
    // (10 /) 2
    trace(divide.curry(10)(2));
    // (/ 2) 10
    trace(divide.rcurry(2)(10));
    // while partials are like the hyphens used in abstract algebra
    // (e.g. Hom(F-, -) ~ Hom(-, G-)), here put to more concrete use:
    // (10 / -) 2
    trace(divide.partial(10, _)(2));
    // (- / 2) 10
    trace(divide.partial(_, 2)(10));
    
    // An application: use with Prototype to define an +onclick+ function
    // that abbreviates Event.observe(_, 'click', ...)
    var onclick = Event.observe.bind(Event).partial(_, 'click');
    // These next three lines are equivalent, except they act on
    // different elements.
    Event.observe('e1', 'click', function(){alert('1')});
    onclick('e2', function(){alert('2')});
    onclick('e3', alert.bind(null).args('3'));
    
    // +lambda+ creates a single-expression functions from a strings.
    // If the expression contains a '_', that's the argument.
    // Otherwise, the symbols are the arguments, in the order
    // they occur.  (+lambda+ doesn't know about keywords, property names,
    // and symbols in strings.  Use -> to tell it about these, or
    // _ for a unary function.)
    var square = 'x*x'.lambda();
    trace(square(3));
    trace('_+1'.lambda()(2));
    trace('x+1'.lambda()(2));
    trace('x+2*y'.lambda()(2, 3));
    // You can just call a string directly, if you're only using it once
    // (and don't need to cache the conversion to a function).
    trace('_+1'.call(null, 2));
    trace('_+1'.apply(null, [2]));
    // Use -> to name the variables when the expression contains symbols
    // that aren't variables (e.g. +Math.sin+), or you want to bind the
    // arguments in a different order from their occurrence in the expression.
    trace('x, y -> x+2*y'.lambda()(2, 3));
    trace('y, x -> x+2*y'.lambda()(2, 3));
    // You can chain -> to create curried functions.
    trace('x -> y -> x+y'.lambda()(2));
    trace('x -> y -> x+y'.lambda()(2)(3));
    
    // The +Functional+ namespace defines the functionals: +map+, +reduce+, +select+,
    // +some+, +every+.  Google will tell you all about these.
    trace(Functional.map(function(x){return x+1}, [1,2,3]));
    // Lambda strings are useful as arguments to functionals.  The functionals
    // convert the string to a function once per call, not once per application.
    trace(Functional.map('_+1', [1,2,3]));
    // +Functional.install()+ imports the functionals into the global namespace,
    // so that we don't have to qualify them with Functional.* each time.
    Functional.install();
    trace(map('_+1', [1,2,3]));
    trace(map('_.length', 'here are some words'.split(' ')));
    trace(select('x>2', [1,2,3,4]));
    trace(reduce('2*x+y', 0, [1,0,1,0]));
    trace(some('x>2', [1,2,3,4]));
    trace(every('x>2', [1,2,3,4]));
    
    // +compose+ and +sequence+ compose sequences of functions
    // backwards and forwards, respectively
    trace(compose('_+1', '_*2')(1));
    trace(sequence('_+1', '_*2')(1));
    trace(compose('_+1', '_*2', '_.length')('a string'));
    trace(compose.apply(null, map('x -> y -> x*y+1', [2,3,4]))(1));
    trace(compose.apply(null, map('x -> y -> x+y', ['hemi', 'demi', 'semi']))('quaver'));
    trace(compose.apply(null, map('x -> y -> x+"-"+y', ['hemi', 'demi', 'semi']))('quaver'));
    trace(compose.apply(null, map('x -> y -> x+"("+y+")"', ['hemi', 'demi', 'semi']))('quaver'));
    // +reduce+ could have handled the last few examples, e.g.:
    trace(reduce('x y -> y+x', 'quaver', ['hemi', 'demi', 'semi'].reverse()));
    trace(reduce.partial('x y -> y+x', _, ['hemi', 'demi', 'semi'].reverse())('quaver'));
    
    // +pluck+ and +invoke+ turn methods into functions:
    trace(map(pluck('length'), ['two', 'words']));
    trace(map(invoke('toUpperCase'), ['two', 'words']));
    // We could use +lambda+ instead:
    trace(map('_.length', ['two', 'words']));
    trace(map('_.toUpperCase()', ['two', 'words']));
}

Function.prototype.reporting = function() {
    var fn = this;
    return function() {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            info(e);
            throw e;
        }
    }
}       

function done(name) {
    var me = arguments.callee;
    me[name] = true;
    if (me.docs && me.examples)
        $('noscript').hide();
}
