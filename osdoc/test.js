/**
 * Invoking the function returned by this function only passes `n`
 * arguments to the underlying function.  If the underlying function
 * is not saturated, the result is a function that passes all its
 * arguments to the underlying function.  (That is, `aritize` only
 * affects its immediate caller, and not subsequent calls.)
 * >> '+'.lambda()(1,2)(3) -> error
 */
String.prototype.apply = function(thisArg, args) {
    return this.toFunction().apply(thisArg, args);
}
