/// `Functional` is the namespace for higher-order functions.
var Functional = window.Functional || {};

/**
 * This function copies all the public functions in `Functional` except itself
 * into the global namespace.  If the optional argument $except$ is present,
 * functions named by its property names are not copied.
 * >> Functional.install()
 */
Functional.install = function(except) {
    var source = Functional,
        target = window;
    for (var name in source)
        name == 'install'
        || name.charAt(0) == '_'
        || except && name in except
        || {}[name] // work around Prototype
        || (target[name] = source[name]);
}

