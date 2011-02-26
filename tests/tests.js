/*
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Created: 2007-07-12
 */

$(document).ready(function() {

  module("Functional JavaScript");

  Functional.install();

  test('I', function() {
      equals(1, Functional.I(1));
  });

  test('flip', function() {
      equals(2, ('a/b'.lambda()).flip()(1,2));
  });

  test('uncurry', function() {
      equals(0.5, ('a -> b -> a/b'.lambda()).uncurry()(1,2));
  });

  test('saturate', function(){
      equals(4, Math.max.curry(1, 2)(3, 4));
      equals(2, Math.max.saturate(1, 2)(3, 4));
      equals(2, Math.max.curry(1, 2).saturate()(3, 4));
  });

  test('Functional', function(){
      equals(2, Functional.flip('a/b')(1, 2));
      equals(0.5, Functional.curry('a/b', 1)(2));
  });

  test('compose', function(){
      equals(5, compose('1+', '2*')(2));
  });

  test('sequence', function(){
      equals(6, sequence('1+', '2*')(2));
  });

  test('reduce', function(){
      equals(10, reduce('x y -> 2*x+y', 0, [1,0,1,0]));
  });

  test('select', function(){
      equals([1,3].join(','), select('%2', [1,2,3,4]).join(','));
  });

  test('foldr', function() {
      equals(104, foldr('x y -> 2*x+y', 100, [1,0,1,0]));
  });

  test('some', function() {
      equals(true, some('>2', [1,2,3]));
      equals(false, some('>10', [1,2,3]));
  });

  test('every', function(){
      equals(false, every('<2', [1,2,3]));
      equals(true, every('<10', [1,2,3]));
  });

  test('not', function() {
      equals(false, not(Functional.K(true))());
      equals(true, not(Functional.K(false))());
  });

  test('invoke', function(){
      equals("123", invoke('toString')(123));
  });

  test('pluck', function() {
      equals(3, pluck('length')("abc"));
  });

  test('until', function() {
      equals(16, until('>10', '2*')(1));
  });

  test('zip', function() {
      equals([[1, 3], [2, 4]].join(','), zip.apply(null, [[1,2],[3,4]]).join(','));
  });

  test('lambda', function(){
      equals(2, 'x -> x + 1'.lambda()(1));
      equals(5, 'x y -> x + 2*y'.lambda()(1, 2));
      equals(5, 'x, y -> x + 2*y'.lambda()(1, 2));
      equals(2, '_ + 1'.lambda()(1));
      equals(2, '/2'.lambda()(4));
      equals(0.5, '2/'.lambda()(4));
      equals(0.5, '/'.lambda()(2,4));
      equals(2, 'x + 1'.lambda()(1));
      equals(5, 'x + 2*y'.lambda()(1, 2));
      equals(5, 'y + 2*x'.lambda()(1, 2));
      equals(5, 'x -> y -> x + 2*y'.lambda()(1)(2));
  });

  test('apply', function() {
      equals(3, 'x+1'.apply(null, [2]));
      equals(0.5, '/'.apply(null, [2, 4]));
  });

  test('call', function() {
      equals(3, 'x+1'.call(null, 2));
      equals(0.5, '/'.call(null, 2, 4));
  });
});
