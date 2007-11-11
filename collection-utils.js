/* Copyright 2007 by Oliver Steele.  Available under the MIT License.  */

/*
 * JavaScript 1.6 Array extensions
 */

Array.prototype.every = function() {
    var len = this.length;
    for (var i = 0 ; i < len; i++)
        if (!fn.call(thisObject, this[i], i, this))
            return false;
    return true;
}

Array.prototype.some = function(fn, thisObject) {
    var len = this.length;
    for (var i = 0 ; i < len; i++)
        if (fn.call(thisObject, this[i], i, this))
            return true;
    return false;
}

Array.prototype.filter = function(fn, thisObject) {
    var len = this.length,
        results = [];
    for (var i = 0 ; i < len; i++)
        if (fn.call(thisObject, this[i], i, this))
            results.push(this[i]);
    return results;
}

Array.prototype.forEach = function(fn, thisObject) {
    var len = this.length;
    for (var i = 0 ; i < len; i++)
        if (typeof this[i] != 'undefined')
            fn.call(thisObject, this[i], i, this);
}

Array.prototype.indexOf = function(searchElement/*, fromIndex*/) {
    var len = this.length;
    for (var i = 0; i < len; i++)
        if (this[i] == searchElement)
            return i;
    return -1;
}

Array.prototype.map = function(fn, thisObject) {
    var len = this.length,
        result = new Array(len);
    for (var i = 0; i < len; i++)
        if (typeof this[i] != 'undefined')
            result[i] = fn.call(thisObject, this[i], i, this);
    return result;
}


/*
 * Prototype Array extensions
 */

Array.prototype.compact = function() {
    var results = [];
    this.forEach(function(item) {
        item == null || item == undefined || results.push(item);
    });
    return results;
}

Array.prototype.detect = function(fn, thisObject) {
    for (var i = 0; i < this.length; i++)
        if (fn.call(thisObject, this[i], i, this))
            return this[i];
    return null;
}

Array.prototype.each = Array.prototype.forEach;

Array.prototype.find = function(item) {
    for (var i = 0; i < this.length; i++)
        if (this[i] == item)
            return true;
    return false;
}

Array.prototype.contains = Array.prototype.find;

Array.prototype.invoke = function(name) {
    var result = new Array(this.length);
    var args = [].slice.call(arguments, 1);
    this.forEach(function(item, ix) {
        result[ix] = item[name].apply(item, args);
    });
    return result;
}

Array.prototype.pluck = function(name) {
    var result = new Array(this.length);
    this.forEach(function(item, ix) {
        result[ix] = item[name];
    });
    return result;
}

Array.prototype.reject = function(fn, thisObject) {
    return this.select(function(item) {return !fn(item)});
}

Array.prototype.select = Array.prototype.filter;

Array.prototype.sum = function() {
    var sum = 0;
    this.forEach(function(n) {sum += n});
    return sum;
}

Array.prototype.without = function(item) {
    return this.filter(function(it) {
        return it != item;
    });
}


/*
 * Other array extensions
 */

Array.prototype.commas = function() {
    return this.join(',');
}

Array.prototype.last = function() {
    var length = this.length;
    return length ? this[length-1] : null;
}


/*
 * Monadic Arrays
 */

Array.toList = function(ar) {
    return ar instanceof Array ? ar : [ar];
}

Array.fromList = function(ar) {
    return ar instanceof Array ? ar[0] : ar;
}


/*
 * Prototype Hash utilities
 */

var Hash = {};

function $H(data) {
    return {
        each: function() {return Hash.each(data)},
        keys: function() {return Hash.keys(data)},
        merge: function(other) {return Hash.merge(data, other)},
        toQueryString: function() {return Hash.toQueryString(data)},
        values: function() {return Hash.values(data)},
        // non-prototype
        compact: function() {return Hash.compact(data)},
        items: function() {return Hash.items(data)}
    };
}

Hash.each = function(hash, fn) {
    var ix = 0;
    for (var key in hash)
        fn({key:key, value:hash[key]}, ix++);
}

Hash.keys = function(hash) {
    var keys = [];
    for (var key in hash)
        keys.push(key);
    return keys;
}

Hash.merge = function(target, source) {
    for (var key in source)
        target[key] = source[key];
    return target;
}

Hash.toQueryString = function(hash) {
    var words = [];
    for (name in hash) {
        var value = hash[name];
        typeof value == 'function' ||
            words.push([name, '=', LzBrowser.urlEscape(value)].join(''));
    }
    words.sort();
    return words.join('&');
}

Hash.values = function(hash) {
    var values = [];
    for (var key in hash)
        values.push(hash[key]);
    return values;
}


/*
 * Other Hash extensions
 */

Hash.compact = function(hash) {
    var result = {};
    for (var name in hash) {
        var value = hash[name];
        if (value != null && value != undefined)
            result[name] = value;
    }
    return result;
}

Hash.items = function(hash) {
    var result = [];
    for (var key in hash)
        result.push({key:key, value:hash[key]});
    return result;
}


/*
 * String utilities
 */

String.prototype.capitalize = function() {
    return this.slice(0,1).toUpperCase() + this.slice(1);
}

String.prototype.escapeHTML = function() {
    return (this.replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;'));
}

String.prototype.inflect = function(suffix) {
    var index = this.indexOf(' ');
    if (index >= 0)
        return this.slice(0, index).inflect(suffix) + this.slice(index);
    // pos == 'v', or vp has single word
    var inflections = {'ed': {'set': 'set'}};
    var key = this.toLowerCase();
    var value = (inflections[suffix]||{})[key];
    if (!value) {
        value = key;
        var lastChar = key.charAt(key.length-1);
        info(0, key);
        switch (lastChar) {
        case 'y':
            if (suffix == 'ed')
                value = value.slice(0, value.length-1) + 'i';
            break;
        case 'e':
            value = value.slice(0, value.length-1);
            break;
        }
        var vowels = "aeiou";
        if (key == value &&
            // CVC -> VCVV
            vowels.indexOf(value.charAt(value.length-1)) < 0 &&
            vowels.indexOf(value.charAt(value.length-2)) >= 0 &&
            vowels.indexOf(value.charAt(value.length-3)) < 0)
            value += value.charAt(value.length-1);
        value += suffix;
    }
    // TODO: capitalize
    return value;
}

String.prototype.pluralize = function(count) {
    if (arguments.length && count == 1)
        return this;
    return this+'s';
}

String.prototype.strip = function() {
    var ws = " \t\n\r";
    for (j = this.length; --j >= 0 && ws.indexOf(this.charAt(j)) >= 0; )
        ;
    for (i = 0; i < j && ws.indexOf(this.charAt(i)) >= 0; i++)
        ;
    return 0 == i && j == this.length-1 ? this : this.slice(i, j+1);
}

String.prototype.truncate = function(length, ellipsis) {
    return (this.length <= length
            ? string
            : string.slice(0, length) + ellipsis);
}
