/*
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc
 * Created: 2007-07-13
 * Modified: 2007-07-16
 *
 * Pre-release version; not ready for prime time.
 *
 * Inspired by Tim Peter's wonderful doctest for Python.
 */

Model.prototype.getTests = function(options) {
    var includeChildren = (options||{}).children,
        tests = [];
    visit(this);
    return tests;
    function visit(model) {
        model.docs.select(function(b){return b.type==CommentBlockTypes.output}).each(function(block) {
            block.lines.each(function(line) {
                var match = line.match(/(.+)\s*->\s*(.*?)\s*$/);
                if (!match) return;
                var input = match[1],
                    result = match[2],
                    test = {definition:model, text:input, line:line, expect:result};
                test[result == 'error' ? 'error' : 'expect'] = result;
                tests.push(test);
            });
        });
        includeChildren && model.definitions.each(function(defn) {
            defn instanceof Model && visit(defn);
        });
    }
}

Model.prototype.getTestText = function() {
    var lines = [];
    this.eachDefinition(function(defn) {
        var tests = defn.getTests();
        tests.length && lines.push('// ' + defn.name);
        tests.each(function(test) {
            if (test.expect) {
                lines.push('console.info(' + test.text.toString() + ');');
                lines.push(['assertEquals(', test.expect, ', ', test.text, ');'].join(''));
            } else
                lines.push(test.text);
        });
        tests.length && lines.push('');
    });
    return lines.join('\n').replace(/^/mg, '    ');
}

Model.prototype.runTests = function() {
    var tests = [],
        failures = [];
    OSDoc.testScope = {};
    this.getTests({children:true}).each(function(test) {
        var defn = test.definition;
        tests.push(test);
        var text = test.text.replace(/^\s*var\s+/, 'OSDoc.testScope.');
        text = text.replace(/^\s*function\s+([A-Z_$][A-Z_$\d]*)/i, 'OSDoc.testScope.$1 = function');
        var result, error;
        try {
            with (OSDoc.testScope)
               result = eval(text);
        } catch (e) {
            error = e;
        }
        if (error)
            test.error
            || failures.push({defn:defn, test:test, error:error});
        else if (test.expect != undefined &&
                 OSDoc.toString(result) != test.expect)
            failures.push({defn:defn, test:test, result:result});
    });
    var lines = [];
    failures.each(function(failure) {
        var message = (failure.error
                       ? [failure.test.text, ' throws ', failure.error]
                       : [failure.test.text, ' -> ', OSDoc.toString(failure.result),
                          ' != ', failure.test.expect]).join('');
        window.console && console.info(message);
        lines.push(failure.defn.name + ': ' + message);
    });
    return {
        tests: tests,
        failure: failures,
        success: !failures.length,
        toHTML: function() {
            return (failures.length
                    ? ['Failed', failures.length, 'out of', tests.length,
                       'API tests:\n', lines.join('\n')]
                    : ['Passed all', tests.length, 'API tests.']).join(' ');
        }
    };
}


OSDoc.APIDoc.prototype.getTestText = function() {
    return this.model.getTestText();
}

OSDoc.APIDoc.prototype.runTests = function() {
    return this.testResults = this.model.runTests();
}