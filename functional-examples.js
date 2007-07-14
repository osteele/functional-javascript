/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional.html
 * Source: http://osteele.com/javascripts/functional-examples.js
 * Created: 2007-07-11
 * Modified: 2007-07-12
 */

// ^ String lambdas

// +lambda+ creates a function from a string that contains a single
// expression.  This function can then be applied to an argument list,
// either at the time:
trace('x+1'.lambda()(2));
trace('x+2*y'.lambda()(2, 3));
// or (more usefully) later:
var square = 'x*x'.lambda();
trace(square(3));
trace(square(4));

// If the string contains a ->, this separates the parameters
// from the expression that is used as the function body.
trace('x y -> x+2*y'.lambda()(2, 3));
trace('y x -> x+2*y'.lambda()(2, 3));

// Otherwise, if the string starts with an operator or relation
// besides -, or ends with an operator or relation, then its
// implicit arguments are placed at the beginning and/or end:
trace('*2'.lambda()(2));
trace('/2'.lambda()(4));
trace('2/'.lambda()(4));
trace('/'.lambda()(2, 4));

// ^^ Chaining

// Chain -> to create curried functions.
trace('x y -> x+y'.lambda()(2, 3));
trace('x -> y -> x+y'.lambda()(2)(3));
trace('x -> y -> x+y'.lambda()(2));

// ^^ Duck-typing

// Strings support +call+ and +apply+.  This duck-types them as
// functions, to some callers.
trace('x+1'.call(null, 2));
trace('x+1'.apply(null, [2]));

// ^ Higher-order functions

// The +Functional+ namespace defines the higher-order functions (HOFs):
// +map+, +reduce+, +select+, and a bunch of others.
trace(Functional.map(function(x){return x+1}, [1,2,3]));
// Lambda strings are useful as arguments to HOFs.  HOFs
// convert the string to a function once per call, not once per application.
trace(Functional.map('_+1', [1,2,3]));
// +Functional.install()+ imports the HOFs into the global namespace (+window+),
// so that they needn't be qualified with Functional.* each time.
Functional.install();
trace(map('+1', [1,2,3]));
trace(map('_.length', 'here are some words'.split(' ')));
trace(select('>2', [1,2,3,4]));
trace(reduce('2*x+y', 0, [1,0,1,0]));
trace(some('>2', [1,2,3,4]));
trace(every('>2', [1,2,3,4]));

// The fusion rule:
trace(map('+1', map('*2', [1,2,3])));
trace(map(compose('+1', '*2'), [1,2,3]));

// +compose+ and +sequence+ compose sequences of functions
// backwards and forwards, respectively:
trace(compose('+1', '*2')(1));
trace(sequence('+1', '*2')(1));
trace(compose('+1', '*2', '_.length')('a string'));
trace(compose.apply(null, map('x -> y -> x*y+1', [2,3,4]))(1));
// +foldr+ (right reduce) could have handled the last example:
trace(foldr('x -> y -> x*y+1'.lambda().uncurry(), 1, [2,3,4]));
trace(foldr('x*y+1', 1, [2,3,4]));

// +pluck+ and +invoke+ turn methods into functions:
trace(map(pluck('length'), ['two', 'words']));
trace(map(invoke('toUpperCase'), ['two', 'words']));
// +lambda+ can do this too:
trace(map('.length', ['two', 'words']));
trace(map('.toUpperCase()', ['two', 'words']));
// and +pluck+ and +lambda+ can both implement projections:
trace(map('_[0]', [['NYC', 'NY'], ['Boston', 'MA'], ['Sacremento', 'CA']]));
trace(map(pluck(0), [['NYC', 'NY'], ['Boston', 'MA'], ['Sacremento', 'CA']]));
trace(map(pluck(1), [['NYC', 'NY'], ['Boston', 'MA'], ['Sacremento', 'CA']]));
trace(map('_.x', [{x:10, y:20}, {x:15, y:25}, {x:0, y:-5}]));
trace(map(pluck('x'), [{x:10, y:20}, {x:15, y:25}, {x:0, y:-5}]));
trace(map(pluck('y'), [{x:10, y:20}, {x:15, y:25}, {x:0, y:-5}]));

// Functional iteration with +until+:
trace(until('>10', '*2')(1));
trace(until('>100', 'x*x')(2));
trace(until(not('<100'), 'x*x')(2));
var fwhile = compose(until.ncurry(2), not).uncurry();
trace(fwhile('<100', 'x*x')(2));

// Higher order higher-order programming:
trace(map('_(1)', map('_.lambda()', ['x+1', 'x-1'])));
trace(map(compose('_(1)', '_.lambda()'), ['x+1', 'x-1']));

// ^ Partial function application

// Create an unspecialized function that just lists its (four) arguments.
// We'll create partially applied (specialized) versions of this function
// below.
function list(a,b,c,d) {return [a,b,c,d]};

// Specialize the first and third parameters.  This creates a new
// function, that interleaves its arguments with the 1 and 2:
var finterleave = list.partial(1,_,2,_);
trace(finterleave(3, 4));

// Specialize the outer two parameters, to produce a function that
// plugs in the inners:
var finners = list.partial(1,_,_,2);
trace(finners(3, 4));

// if not all the parameters are supplied, the result is a function...
trace(finterleave(4));
// ...which can be applied until the argument list is saturated:
trace(finterleave(3)(4));
trace(finners(_,3));
trace(finners(_,3)(4));
trace(finners(3)(4));
trace(list.partial(_,_,_,1)(2,_,3)(4));

// An application: create some specialized versions of String replace.
// The first function replaces vowels in its object with its argument:
var replaceVowels = "".replace.partial(/[aeiou]/g, _);
// This is a method, so use +call+ to invoke it on an object:
trace(replaceVowels.call("change my vowels to underscores", '_'));
// The second function replaces slices that match its argument with 'th':
var replaceWithCoronalFricatives = "".replace.partial(_, 'th');
trace(replaceWithCoronalFricatives.call("substitute my esses with tee-aitches", /s/g));

// +curry+ creates a new function that applies the original arguments, and
// then the new arguments:
var right = list.curry(1, 2);
trace(right(3,4));
var left = list.rcurry(1, 2);
trace(left(3, 4));

// Use +rcurry+ ("right curry") to create +halve+ and +double+ functions from
// +divide+:
function divide(a, b) {return a/b}
var halve = divide.rcurry(2);
var double = divide.rcurry(1/2);
trace(halve(10));
trace(double(10));

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
//  (10 /) 2
trace(divide.curry(10)(2));
//  (/ 2) 10
trace(divide.rcurry(2)(10));
// while partials are like the hyphens used in abstract algebra
// (e.g. in Hom(F-, -) = Hom(-, G-)):
//  (10 / -) 2
trace(divide.partial(10, _)(2));
//  (- / 2) 10
trace(divide.partial(_, 2)(10));

// The new methods on +Function+ are also available as functions in +Functional+
// (and, if +Functional.install+ has been called, in the global namespace too).
// The latter can be applied to string lambda's, too:
trace(curry('+', 1)(2));

// ^ Using Functional with Prototype

// Prototype defines a larger set of collection functions than
// Functional, and attaches them to Array so that they can
// be chained.
// Invoke +lambda+ on a string to create a function for Prototype:
trace([1, 2, 3].map('x*x'.lambda()));
trace([1, 2, 3].map('x*x'.lambda()).map('x+1'.lambda()));

// Define an +onclick+ function that abbreviates Event.observe(_, 'click', ...):
var onclick = Event.observe.bind(Event).partial(_, 'click');
// These next three lines are equivalent, just applied to different targets:
Event.observe('e1', 'click', function(){alert('1')});
onclick('e2', function(){alert('2')});
onclick('e3', alert.bind(null).saturate('3'));
