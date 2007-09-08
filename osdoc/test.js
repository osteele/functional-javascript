/**
 * Returns a function that applies the last argument of this
 * function to its input, and the penultimate argument to the
 * result of the application, and so on.
 * == compose(f1, f2, f3..., fn)(args) == f1(f2(f3(...(fn(args...)))))
 * :: (a2 -> a1) (a3 -> a2)... (a... -> a_{n}) -> a... -> a1
 * >> compose('1+', '2*')(2) -> 5
 *
 *   preformatted
 */
Functional.compose = function(/*fn...*/) {
}