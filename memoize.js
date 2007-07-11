/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  Homepage: http://osteele.com/sources/javascript
  Download: http://osteele.com/sources/javascript/memoize.js
  Docs: http://osteele.com/sources/javascript/docs/memoize
  Example: http://osteele.com/sources/javascript/demos/memoization.html
  License: MIT License.
  Created: 2006-03-23
  
  Implements memoization for global functions and methods.

  == Features
  * Automatic per-instance caching.  +a.m()+ and +b.m()+ will
  use separate memo tables.
  * Caches results that are false-like (e.g. +0+, +null+, and <tt>''</tt>).
  * Fast path for nonary method, e.g. +bezier.getLength()+.
  * Correctly distinguishes among arguments with the same string
  representation; e.g. +f(null)+, +f('')+, and +f([])+; +f([])+ and
  +f([''])+; etc.
  * Allows overriding the cache key generator with a custom key
  generator
  
  == Usage
  === Memoizing a global function
    function fib(n) {
      if (n < 2) return 1;
      return fib(n-2) + fib(n-1);
    }
    memoize('fib');
  
  Or:
    var fib = function(n) {
      if (n < 2) return 1;
      return fib(n-2) + fib(n-1);
    }.memoize();
  
  === Memozing a method
    function MyClass() {}
	MyClass.prototype.fib = function(n) {
	  if (n < 2) return 1;
	  return this.fib(n-2) + this.fib(n-1);
	};
	memoize('MyClass.fib');
  
  Or:
    function MyClass() {}
	MyClass.prototype.fib = function(n) {
	  if (n < 2) return 1;
	  return this.fib(n-2) + this.fib(n-1);
	}.memoize();
  
  === Resetting the memoization cache
  === Using a custom key generator
*/

/*
  Agenda:
  - benchmark nonnary
  - clean up code
  - fix or remove reset
  - docs
  - remove +object+ from memoize
  - special case for nonnary with this
*/

Function.prototype.memoize = function(keyfn) {
    keyfn = keyfn || arguments.callee.simpleSerializer;
    var self = this, nonaryfn, value, globalValues;
	var fnid = String(arguments.callee.uidGenerator++);
	//fnid = String(this);
    var mfn = function() {
        //if (!arguments.length) return nonaryfn();
        var key = new Array(arguments.length);
        for (var i = 0; i < arguments.length; i++)
            key[i] = keyfn(arguments[i]);
		key = key.join(',');
		var cache = globalValues;
		if (this) {
			var caches = this._memoCache || (this._memoCache = {});
			cache = caches[fnid] || (caches[fnid] = {});
		}
		// testing both 'key in cache' and 'cache[key]' doesn't
		// cost extra in Firefox 1.5 and Safari 2.0.2.
        return key in cache ? cache[key] : cache[key] = self.apply(this, arguments);
    }
    mfn.reset = function() {
        nonaryfn = function() {
            value = self.apply(object);
            return (nonaryfn = function(){return value})();
        };
        globalValues = {};
    };
    mfn.reset();
    return mfn;
};

Function.prototype.memoize.uidGenerator = 0;

Function.prototype.memoize.simpleSerializer = function(value) {
    if (value instanceof Array) {
        var s = new Array(value.length);
        for (var i = 0; i < value.length; i++)
            s[i] = arguments.callee(value[i]);
        return '[' + s.join(',') + ']';
    }
    if (value instanceof Object) {
        var s = [];
        for (var p in value)
            s[s.length] = p + ':' + arguments.callee(value[i]);
        return '{' + s.join(',') + '}';
    }
    if (typeof value == 'string')
        return '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"';
    return String(value);
};

Object.prototype.memoize = function(fn, keyfn) {
    this[name] = this[name].memoize(keyfn);
};

function memoize(name, keyfn) {
	var object = window;
	var path = name.split('.'), i = 0;
	while (true) {
		name = path[i++];
		if (i == path.length) break;
		object = object[name] || object.prototype[name];
	}
	object[name] = object[name].memoize(keyfn);
}