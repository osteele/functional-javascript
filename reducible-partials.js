/*
Agenda:
- use functionals to define full version? or specialize it?

a system for defining a set of operations that each set
options that are used to build an underlying object

{object:this, curry:none, args:[], subpos:[]}
bind(obj): options.object = object
partial(): adds to options.args and options.subpos?
curry(): options.curry = 1;
rcurry(): options.rcurry = -1;

each of these creates a new options,
applies make() to it to create a fn

make() creates a fn
and sets bind, partial, curry, rcurry to fns that modify a copy of options
  and apply make() to the modified options

fn(a,b,c).partial(1,_,_).partial(2) =
  fn(a,b,c).partial(1,2,_)
fn(a,b,c).partial(1,_,_).partial(_,2) =
  fn(a,b,c).partial(1,_,2)

applying a partial to a partial:
  for each (ix, value) in *new*:
    if value == _
      
Part 1: partial function application

Part 2: computing closure contraction  

bind returns a fn1.
fn1.partial returns bind+partial fn2.
  fn2.curry returns bind+partial+curry
fn1.curry return bind+curry fn3.
  fn3.curry returns bind+partial+curry
(If fn1.bind returns a new bound fn, that's okay.)

partial returns fn1.
fn1.bind returns bind+partial fn2.
  fn2.curry returns bind+partial+curry.
return bind+partial.

constructor makeit(object, curry, partial, arguments)
 */

