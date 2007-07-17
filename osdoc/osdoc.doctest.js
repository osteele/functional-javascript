/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc
 * Created: 2007-07-13
 * Modified: 2007-07-16
 *
 * Inspired by Tim Peter's wonderful doctest for Python.
 */

OSDoc.APIDoc.prototype.runTests = function() {
    var tests = [];
    var failures = [];
    this.records.each(function(defn) {
        defn.tests.each(function(test) {
            tests.push(test);
            try {
                var result = eval(test.text);
            } catch (e) {
                test.expect == 'error'
                    || failures.push({defn: defn, test: test, error: e});
                return;
            }
            if (test.expect != undefined && OSDoc.toString(result) != test.expect)
                failures.push({defn: defn, test: test, result: result});
        });
    });
    var lines = [];
    failures.each(function(failure) {
        var message = (failure.error
                       ? [failure.test.text, ' throws ', failure.error]
                       : [failure.test.text, ' -> ', OSDoc.toString(failure.result), ' != ', failure.test.expect]).join('');
        window.console && console.info(message);
        lines.push(failure.defn.name + ': ' + message);
    });
    return this.testResults = {
        tests: tests,
        failure: failures,
        success: !failures.length,
        toHTML: function() {
            return (failures.length
                    ? ['Failed', failures.length, 'out of', tests.length, 'API tests:\n'+lines.join('\n')]
                    : ['Passed all', tests.length, 'API tests.']).join(' ');
        }
    };
}

OSDoc.APIDoc.prototype.createTestText = function() {
    var lines = [];
    this.records.each(function(defn) {
        defn.tests.length && lines.push('// ' + defn.name);
        defn.tests.each(function(test) {
            if (test.expect) {
                lines.push('console.info(' + test.text.toString() + ');');
                lines.push(['assertEquals(', test.expect, ', ', test.text, ');'].join(''));
            } else
                lines.push(test.text);
        });
        defn.tests.length && lines.push('');
    });
    return lines.join('\n').replace(/^/mg, '    ');
}
