/**
  * Returns its argument coerced to a function.
  * >> lambda(1+)(2) -> 3
  * >> lambda(function(n){return n+1})(2) -> 3
  */
Functional.lambda = function(object) {
    return object.toFunction();
}

Functional.undoc = function(object) {
}