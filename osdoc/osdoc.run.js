/*
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Source: http://osteele.com/javascripts/osdoc
 */

var window = {};
window.OSDoc = {loaded:true};
window.Prototype = {Version:1.5};
load('../collection-utils.js');
load('../functional/functional.js');
load('../functional/to-function.js');
load('Base.js')
load('osdoc.js');
load('osdoc.utils.js');
load('osdoc.apidoc.js');
load('osdoc.doctest.js');

var pluck = Functional.pluck;

function process(files, options) {
    var text = files.map('readFile(_)').join(''),
        model = new OSDoc.APIDoc.Parser({}).parse(text);
    if (options.test) {
        print(model.runTests().toHTML());
    } else if (options.tests) {
        print(model.getTestText());
    } else {
        formatter = new HTMLFormatter({}),
        html = formatter.render(model);
        print(html);
    }
}

function usage() {
    print("usage: osdoc.run.js [options] [files]");
    //exit(1);
}

function main(arguments) {
    var options = {},
        files = [];
    while (arguments.length) {
        var arg = arguments.shift();
        if (/^-/(arg)) {
            switch (arg) {
            case '--test':
                options.test = true;
                break;
            case '--tests':
                options.tests = true;
                break;
            default:
                usage();
            }
        } else
            files.push(arg);
    }
    files.length || usage();
    process(files, options);
}

function test() {
    main('--test ../functional/functional.js'.split(/\s+/));
}

arguments.length && main(arguments);
