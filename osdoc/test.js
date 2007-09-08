/**
 * This function copies all the public functions in `Functional` except itself
 * into the global namespace.  If the optional argument $except$ is present,
 * functions named by its property names are not copied.
 * >> Functional.install()
 */
var Functional = window.Functional || {};
