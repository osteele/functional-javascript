/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Created: 2007-07-12
 */

function toString(value) {
    if (value instanceof Array) {
        var spans = map(toString, value);
        return '[' + spans.join(', ') + ']';
    }
    switch (typeof(value)) {
    case 'function': return 'function()';
    case 'string': return '"' + value + '"';
    case 'undefined': return 'undefined';
    default: return value.toString();
    }
}

function assertEquals(expect, result) {
    console.info(expect, result);
    if (toString(expect) != toString(result))
        console.info(expect, '!=', result);
}

// The content of this function is automatically generated.
function test() {
    // I
    console.info(Functional.I(1));
    assertEquals(1, Functional.I(1));
    
    // flip
    console.info(('a/b'.lambda()).flip()(1,2));
    assertEquals(2, ('a/b'.lambda()).flip()(1,2));
    
    // uncurry
    console.info(('a -> b -> a/b'.lambda()).uncurry()(1,2));
    assertEquals(0.5, ('a -> b -> a/b'.lambda()).uncurry()(1,2));
    
    // saturate
    console.info(Math.max.curry(1, 2)(3, 4));
    assertEquals(4, Math.max.curry(1, 2)(3, 4));
    console.info(Math.max.saturate(1, 2)(3, 4));
    assertEquals(2, Math.max.saturate(1, 2)(3, 4));
    console.info(Math.max.curry(1, 2).saturate()(3, 4));
    assertEquals(2, Math.max.curry(1, 2).saturate()(3, 4));
    
    // Functional
    console.info(Functional.flip('a/b')(1, 2));
    assertEquals(2, Functional.flip('a/b')(1, 2));
    console.info(Functional.curry('a/b', 1)(2));
    assertEquals(0.5, Functional.curry('a/b', 1)(2));
    
    // install
    Functional.install()
    
    // compose
    console.info(compose('1+', '2*')(2));
    assertEquals(5, compose('1+', '2*')(2));
    
    // sequence
    console.info(sequence('1+', '2*')(2));
    assertEquals(6, sequence('1+', '2*')(2));
    
    // reduce
    console.info(reduce('x y -> 2*x+y', 0, [1,0,1,0]));
    assertEquals(10, reduce('x y -> 2*x+y', 0, [1,0,1,0]));
    
    // select
    console.info(select('%2', [1,2,3,4]));
    assertEquals([1, 3], select('%2', [1,2,3,4]));
    
    // foldr
    console.info(foldr('x y -> 2*x+y', 100, [1,0,1,0]));
    assertEquals(104, foldr('x y -> 2*x+y', 100, [1,0,1,0]));
    
    // some
    console.info(some('>2', [1,2,3]));
    assertEquals(true, some('>2', [1,2,3]));
    console.info(some('>10', [1,2,3]));
    assertEquals(false, some('>10', [1,2,3]));
    
    // every
    console.info(every('<2', [1,2,3]));
    assertEquals(false, every('<2', [1,2,3]));
    console.info(every('<10', [1,2,3]));
    assertEquals(true, every('<10', [1,2,3]));
    
    // not
    console.info(not(Functional.K(true))());
    assertEquals(false, not(Functional.K(true))());
    console.info(not(Functional.K(false))());
    assertEquals(true, not(Functional.K(false))());
    
    // invoke
    console.info(invoke('toString')(123));
    assertEquals("123", invoke('toString')(123));
    
    // pluck
    console.info(pluck('length')("abc"));
    assertEquals(3, pluck('length')("abc"));
    
    // until
    console.info(until('>10', '2*')(1));
    assertEquals(16, until('>10', '2*')(1));
    
    // zip
    console.info(zip.apply(null, [[1,2],[3,4]]));
    assertEquals([[1, 3], [2, 4]], zip.apply(null, [[1,2],[3,4]]));
    
    // lambda
    console.info('x -> x + 1'.lambda()(1));
    assertEquals(2, 'x -> x + 1'.lambda()(1));
    console.info('x y -> x + 2*y'.lambda()(1, 2));
    assertEquals(5, 'x y -> x + 2*y'.lambda()(1, 2));
    console.info('x, y -> x + 2*y'.lambda()(1, 2));
    assertEquals(5, 'x, y -> x + 2*y'.lambda()(1, 2));
    console.info('_ + 1'.lambda()(1));
    assertEquals(2, '_ + 1'.lambda()(1));
    console.info('/2'.lambda()(4));
    assertEquals(2, '/2'.lambda()(4));
    console.info('2/'.lambda()(4));
    assertEquals(0.5, '2/'.lambda()(4));
    console.info('/'.lambda()(2,4));
    assertEquals(0.5, '/'.lambda()(2,4));
    console.info('x + 1'.lambda()(1));
    assertEquals(2, 'x + 1'.lambda()(1));
    console.info('x + 2*y'.lambda()(1, 2));
    assertEquals(5, 'x + 2*y'.lambda()(1, 2));
    console.info('y + 2*x'.lambda()(1, 2));
    assertEquals(5, 'y + 2*x'.lambda()(1, 2));
    console.info('x -> y -> x + 2*y'.lambda()(1)(2));
    assertEquals(5, 'x -> y -> x + 2*y'.lambda()(1)(2));
    
    // apply
    console.info('x+1'.apply(null, [2]));
    assertEquals(3, 'x+1'.apply(null, [2]));
    console.info('/'.apply(null, [2, 4]));
    assertEquals(0.5, '/'.apply(null, [2, 4]));
    
    // call
    console.info('x+1'.call(null, 2));
    assertEquals(3, 'x+1'.call(null, 2));
    console.info('/'.call(null, 2, 4));
    assertEquals(0.5, '/'.call(null, 2, 4));
    
    return 'passed';
}
