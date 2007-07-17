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
    $('noscript').innerHTML = $('noscript').innerHTML.replace(/<span.*?<\/span>/,
                                                              'If this message remains on the screen,');
    gExamples = new OSDoc.Examples({onSuccess: done.saturate('examples'), target: $('examples')}).load('examples.js');
    gDocs = new OSDoc.APIDoc({onSuccess: done.saturate('docs'), target: $('docs')}).load('functional.js');
    gEval = new Evaluator('#evaluator', {onUpdate: showEvaluator});
    initializeHeaderToggle();
    initializeTestLinks();
    $$('#header pre').each('_.innerHTML = OSDoc.unindent(_.innerHTML)'.lambda());
    resetGradients();
}

function showEvaluator() {
    $('header').show();
    var doctop = document.documentElement.scrollTop || document.body.scrollTop;
    var elt = $('evaluator');
    var bottom = Position.cumulativeOffset(elt)[1] + Element.getHeight(elt);
    if (bottom < doctop) {
        var x = document.documentElement.scrollTop || document.body.scrollTop;
        var y = elt.y ? element.y : elt.offsetTop;
        window.scrollTo(0, y);
    }
    resetGradients();
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
        $('evaluator').show();
        var inputs = $$('kbd');
        gEval.makeClickable(inputs);
        window.location.search.match(/[\?&]test\b/) &&
            gDocs.runTests();
        queueGradientReset();
        Event.observe(window, 'resize', queueGradientReset);
    }
}

//
// Gradients
//

queueGradientReset = (function() {
    var resizer;
    return function() {
        resizer = resizer || window.setTimeout(function() {
            resizer = null;
            resetGradients();
        }, 60);
    }
})();

function resetGradients() {
    $('evaluator').style.display != 'none'
        && resetGradient('evaluator', 0xeeffee, 0xddffdd);
    resetGradient('intro', 0xeeeeff);
}

function resetGradient(name, color, c2) {
    var parent = $(name);
    var old = ($A(parent.childNodes).select('.className=="grad"'.lambda()));
    old.each(parent.removeChild.bind(parent));
    var children = $A(parent.childNodes).slice(0);
    OSGradient.applyGradient({'gradient-start-color': color,
                              'gradient-end-color': arguments.length>2?c2:0xffffff,
                              'border-radius': 15},
                             parent);
    var newed = $A(parent.childNodes).reject(children.include.bind(children));
    newed.each('.className="grad"'.lambda());
}


Event.observe(window, 'load', initialize);
