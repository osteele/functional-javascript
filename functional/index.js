/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Created: 2007-07-11
 * Modified: 2007-07-15
 */

var info = window.console && console.info || function(){};

// debugging references
var gExamples, gDocs;

var gEval;

function initialize() {
    gExamples = new OSDoc.Examples({onLoad: done.saturate('examples'), target: $('examples')}).load('examples.js');
    gDocs = new OSDoc.APIDoc({onLoad: done.saturate('docs'), target: $('docs')}).load('functional.js');
    gEval = new Evaluator('#evaluator', {onUpdate: showEvaluator});
    initializeHeaderToggle();
    initializeTestLinks();
}

function showEvaluator() {
    $('header').show();
    var doctop = document.documentElement.scrollTop || document.body.scrollTop;
    var elt = $('evaluator');
    var bottom = Position.cumulativeOffset(elt)[1] + Element.getHeight(elt);
    info(doctop, bottom);
    if (bottom < doctop) {
        var x = document.documentElement.scrollTop || document.body.scrollTop;
        var y = elt.y ? element.y : elt.offsetTop;
        window.scrollTo(0, y);
    }
}

function initializeHeaderToggle() {
    Event.observe('header-toggle', 'click', updateHeaderState);
    updateHeaderState();
    function updateHeaderState(e) {
        $$('#header').invoke($F('header-toggle') ? 'show' : 'hide');
    }
}

function initializeTestLinks() {
    Event.observe('run-tests', 'click', function(e) {
        Event.stop(e);
        var results = gDocs.runTests();
        alert(results.toHTML());
    });
    Event.observe('write-tests', 'click', function(e) {
        Event.stop(e);
        var text = gDocs.createTestText();
        document.write('<pre>'+text.escapeHTML()+'</pre>');
    });
}

function done(flag) {
    var callee = arguments.callee;
    callee[flag] = true;
    if (callee.docs && callee.examples) {
        $('noscript').hide();
        var inputs = $$('kbd');
        gEval.makeClickable(inputs);
        window.location.search.match(/[\?&]test\b/) &&
            gDocs.runTests();
    }
}

Event.observe(window, 'load', initialize);
