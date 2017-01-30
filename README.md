# Functional JavaScript (deprecated)

This code, from 2007, is deprecated. I'm keeping it available for historical interest.

Some of the ideas in this code and in its companion `collections.js` were used in Jeremy Ashkenas's [Underscore.js](http://underscorejs.org), which in turn inspired [Lodash](https://lodash.com). Use those instead.

[CoffeeScript](http://coffeescript.org) (aso by Jeremy Ashkenas) and ECMAScript 6 also include [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) and functional programming functions such as `map`. If you use these languages, or many other modern languages that compile into ECMAScript, you can do functional prorammming entirely within the language.

Thanks to everyone who has contributed, and to everyone who has thanked me over the years, thank you in turn.

# Links

* [Demo page](http://osteele.com/sources/javascript/functional/)
* [Announcement](http://blog.osteele.com/2007/07/functional-javascript/)
* [Original README file](https://github.com/osteele/functional-javascript/blob/master/README) (also below)
* [Original repo (Google Code)](https://code.google.com/archive/p/functional-javascript/)

# Original README

Functional defines higher-order methods and functions for functional
and function-level programming.  It also defines "string lambdas",
that allow strings such as `x+1` and `x -> x+1` to be used in some
contexts as functions.

It is licensed under the MIT License.

For more details, see http://osteele.com/sources/javascript/functional/.

## Credits

- Oliver Steele – original author
- Dean Edwards – `Array.slice` suggestion
- henrah – `Function.lambda` memoization
- Raganwald – Rhino compatibility
- Jesse Hallett – Spidermonkey shell compatibiilty
- Florian Schäfer – allow leading and trailing spaces in expressions
- Angus Croll – bug fix
