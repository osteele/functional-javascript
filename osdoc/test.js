 *
 * This file defines some higher-order methods and functions for functional and
 * function-level programming.  It also defines "string lambdas", that allow strings
 * such as `x+1` and `x -> x+1` to be used in some contexts as functions.
 */


/// `Functional` is the namespace for higher-order functions.
var Functional = window.Functional || {};

/**
 * This function copies all the public functions in `Functional` except itself
 * into the global namespace.  If the optional argument $except$ is present,
 * functions named by its property names are not copied.
 * >> Functional.install()
 */
Functional.install = function(except) {}

/**
 * Returns a function that applies the last argument of this
 * function to its input, and the penultimate argument to the
 * result of the application, and so on.
 * == compose(f1, f2, f3..., fn)(args) == f1(f2(f3(...(fn(args...)))))
 * :: (a2 -> a1) (a3 -> a2)... (a... -> a_{n}) -> a... -> a1
 * >> compose('1+', '2*')(2) -> 5
 */
Functional.compose = function(/*fn...*/) {}
