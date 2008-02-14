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

// `lambda` creates a function from a string that contains a single
// expression.  This function can then be applied to an argument list,
// either immediately:
trace('x+1'.lambda()(2));
trace('x+2*y'.lambda()(2, 3));
// or (more usefully) later:
var square = 'x*x'.lambda();
trace(square(3));
trace(square(4));

// ^^ Explicit parameters

// If the string contains a `->`, this separates the parameters
// from the body.
trace('x y -> x+2*y'.lambda()(2, 3));
trace('y x -> x+2*y'.lambda()(2, 3));

// Otherwise, if the string contains a `_`, it's a unary function
// and `_` is name of the parameter:
trace('_ -> _+1'.lambda()(2));
trace('_ -> _*_'.lambda()(3));

// ^^ Implicit parameters

// If the string doesn't specify explicit parameters, they
// are implicit.

// If the string starts with an operator or relation
// besides `-`, or ends with an operator or relation, then its
// implicit arguments are placed at the beginning and/or end:
trace('*2'.lambda()(2));
trace('/2'.lambda()(4));
trace('2/'.lambda()(4));
trace('/'.lambda()(2, 4));
// '.' counts as a right operator:
trace('.x'.lambda()({x:1, y:2}));

// Otherwise, the variables in the string, in order of occurrence,
// are its parameters.
trace('x+1'.lambda()(2));
trace('x*x'.lambda()(3));
trace('x + 2*y'.lambda()(1, 2));
trace('y + 2*x'.lambda()(1, 2));

// ^^ Chaining

// Chain -> to create curried functions.
trace('x y -> x+y'.lambda()(2, 3));
trace('x -> y -> x+y'.lambda()(2)(3));
trace('x -> y -> x+y'.lambda()(2));

// ^ Higher-order functions

// The `Functional` namespace defines the higher-order functions (functionals):
// `map`, `reduce`, `select`, and a bunch of others.
trace(Functional.map(function(x){return x+1}, [1,2,3]));
// Lambda strings are useful as arguments to functionals.  Functionals
// convert the string to a function once per call, not once per application.
trace(Functional.map('_+1', [1,2,3]));
// `Functional.install()` imports the functionals into the global namespace (`window`),
// so that they needn't be qualified with `Functional.`* each time.
Functional.install();
trace(map('+1', [1,2,3]));
trace(map('_.length', 'here are some words'.split(' ')));
trace(select('>2', [1,2,3,4]));
trace(reduce('2*x+y', 0, [1,0,1,0]));
trace(some('>2', [1,2,3,4]));
trace(every('>2', [1,2,3,4]));

// `compose` and `sequence` compose sequences of functions
// backwards and forwards, respectively:
trace(compose('+1', '*2')(1));
trace(sequence('+1', '*2')(1));
trace(compose('+1', '*2', '_.length')('a string'));
trace(compose.apply(null, map('x -> y -> x*y+1', [2,3,4]))(1));
// `foldr` (right reduce) could have handled the last example:
trace(foldr('x -> y -> x*y+1'.lambda().uncurry(), 1, [2,3,4]));
trace(foldr('x*y+1', 1, [2,3,4]));

// `pluck` and `invoke` turn methods into functions:
trace(map(pluck('length'), ['two', 'words']));
trace(map(invoke('toUpperCase'), ['two', 'words']));
// `lambda` can do this too:
trace(map('.length', ['two', 'words']));
trace(map('.toUpperCase()', ['two', 'words']));
// and `pluck` and `lambda` can both implement projections:
var cities =  [['NYC', 'NY'], ['Boston', 'MA']];
trace(map('_[0]',cities));
trace(map(pluck(0), cities));
trace(map(pluck(1), cities));
trace(map('_.x', [{x:10, y:20}, {x:15, y:25}, {x:0, y:-5}]));
trace(map(pluck('x'), [{x:10, y:20}, {x:15, y:25}, {x:0, y:-5}]));
trace(map(pluck('y'), [{x:10, y:20}, {x:15, y:25}, {x:0, y:-5}]));

// Functional iteration with `until`:
trace(until('>10', '*2')(1));
trace(until('>100', 'x*x')(2));
trace(until(not('<100'), 'x*x')(2));
var fwhile = compose(until.ncurry(2), not).uncurry();
trace(fwhile('<100', 'x*x')(2));

// Higher order higher-order programming, and the fusion rule:
trace(map('_(1)', map('_.lambda()', ['x+1', 'x-1'])));
trace(map(compose('_(1)', '_.lambda()'), ['x+1', 'x-1']));

// ^ Function methods

// Functional attaches a number of methods to `Function`, that are
// useful for functional method chaining and functional-level programming.
// Here are a few.

// ^^ Guards
// The first expression below (without `guard`) attempts the reciprocal of *all*
// the list items.
// The second expression guards the division so that it's not applied to null.
trace(map('1/', [1,2,null,4]));
trace(map(guard('1/'), [1,2,null,4]));
// Double only the even numbers:
var xs = [1,2,3,4];
trace(map(guard('2*', not('%2')), xs));
// `filter` creates a list with only the predicated elements,
// while `guard` can be used to replace them by null, but leave
// the indices of the remaining elements unchanged:
trace(filter('%2', xs));
trace(map(guard(Functional.K(null), '%2'), xs));
// Replace odd numbers by 'odd'
trace(map(guard(Functional.K('odd'), '%2'), xs));
// Or label "even" and "odd":
trace(map(guard(Functional.K('odd'), '%2', Functional.K('even')), xs));
// although we could also use any one of these for the last one:
trace(map(curry('o[ix]', ['even', 'odd']).compose('%2'), xs));
trace(map(curry('o[i%2]', ['even', 'odd']), xs));
trace(map('["even","odd"][_%2]', xs));

// ^^ Curry

// `curry` creates a new function that applies the original arguments, and
// then the new arguments:
var right = list.curry(1, 2);
trace(right(3,4));
var left = list.rcurry(1, 2);
trace(left(3, 4));

// Use `rcurry` ("right curry") to create `halve` and `double` functions from
// `divide`:
function divide(a, b) {return a/b}
var halve = divide.rcurry(2);
var double = divide.rcurry(1/2);
trace(halve(10));
trace(double(10));

// `ncurry` and `rncurry` wait until they're fully saturated before
// applying the function.
trace(list.ncurry(4,1,2)(3));
trace(list.ncurry(4,1,2)(3)(4));
trace(list.ncurry(4,1,2)(3,4));
trace(list.rncurry(4,1,2)(3));
trace(list.rncurry(4,1,2)(3,4));
// [r]curry can't do this because it doesn't
// in general know the polyadicity of the underlying function.
// (Sometimes `fn.length` works, but some functions, especially
// constructed functions, don't declare all their arguments, so
// `fn.length` this lies.)
trace(list.curry(1,2)(3));

// ^^ Partial function application

// `curry` is a special case of partial function application.
// `partial` is the general case.  `partial` can
// specialize parameters in the middle of the parameter list;
// the `curry` functions have to fill them in from the end.

// `list` is an unspecialized function that returns an array of its (four) arguments.
// We'll create partially applied (specialized) versions of this function
// below.
function list(a,b,c,d) {return [a,b,c,d]};

// Specialize the first and third parameters.  This creates a new
// function, that interleaves its arguments with the 1 and 2:
var finterleave = list.partial(1,_,2,_);
trace(finterleave(3, 4));

// Specialize the outer two parameters, to produce a function whose
// arguments supply the middle two arguments to `list`:
var finners = list.partial(1,_,_,2);
trace(finners(3, 4));

// if not all the parameters are supplied, the result is a function...
trace(finterleave(4));
// ...which can be applied repeatedly until the argument list is saturated:
trace(finterleave(3)(4));
trace(finners(_,3));
trace(finners(_,3)(4));
trace(finners(3)(4));
trace(list.partial(_,_,_,1)(2,_,3)(4));

// Two specializations of String's `replace` method.
// The function replaces vowels in its object with the value of its
// argument:
var replaceVowels = "".replace.partial(/[aeiou]/g, _);
// This is a method, so use `call` to invoke it on an object:
trace(replaceVowels.call("change my vowels to underscores", '_'));
// The second function replaces slices that match the pattern of its argument,
// with 'th':
var replaceWithCoronalFricatives = "".replace.partial(_, 'th');
var str = "substitute my esses with tee-aitches"
trace(replaceWithCoronalFricatives.call(str, /s/g));

// The syntax for partials is meant to suggest the hyphen placeholders
// in abstract algebra:
//   Hom(F-, -) = Hom(-, G_)
// This isn't unification or pattern-matching, though.  All the hyphens
// have to be at the top level (as arguments, not items in lists, etc.).
// And  there's no facility for binding two hyphens to the same parameter
// position.

// ^^ Methods on Function are object-free functions too

// The higher-order methods on `Function` are also available as
// functions, that take a function as their first argument.  These
// functions are in the `Functional` namespace.  `Functional.install`
// also installs these functions in the global namespace.
// 
// Unlike the methods on Function, these functions can be applied to
// string lambdas too:
trace('+'.lambda().curry(1)(2));
trace(curry('+', 1)(2));
trace(bind('-> this', 1)());

// ^ Using Functional with Prototype

// Prototype defines a larger set of collection functions than
// Functional, and attaches them to Array so that they can
// be chained.
// Invoke `lambda` on a string to create a function for Prototype:
trace([1, 2, 3].map('x*x'.lambda()));
trace([1, 2, 3].map('x*x'.lambda()).map('x+1'.lambda()));

// Define an `onclick` function that abbreviates `Event.observe(_, 'click', ...)`:
var onclick = Event.observe.bind(Event).partial(_, 'click');
// These next three statements have the same effect.  Click on a
// of the buttons to execute the corresponding function.
Event.observe('e1', 'click', function(){ alert('1'); });
onclick('e2', function(){ alert('2'); });
onclick('e3', alert.bind(null).saturate('3'));
