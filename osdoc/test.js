/**
 * ^^ Duck-Typing
 * 
 * Strings support `call` and `apply`.  This duck-types them as
 * functions, to some callers.
 */

/**
 * Coerce the string to a function and then apply it.
 * >> 'x+1'.apply(null, [2]) -> 3
 * >> '/'.apply(null, [2, 4]) -> 0.5
 */
String.prototype.apply = function(thisArg, args) {
    return this.toFunction().apply(thisArg, args);
}

/**
 * Coerce the string to a function and then call it.
 * >> 'x+1'.call(null, 2) -> 3
 * >> '/'.call(null, 2, 4) -> 0.5
 */
String.prototype.call = function() {
    return this.toFunction().apply(arguments[0], [].slice.call(arguments, 1));
}

