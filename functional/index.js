/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Created: 2007-07-11
 * Modified: 2007-07-21
 */

var info = window.console && console.info || function(){};
var gEval;

// debugging references
var gExamples, gDocs;

function initialize() {
    $('noscript').innerHTML = $('noscript').innerHTML.replace(
            /<span.*?<\/span>/,
        'If this message remains on the screen,');
    gExamples = new OSDoc.Examples({onSuccess: noteCompletion.saturate('examples'), target: $('examples')}).load('examples.js');
    gDocs = new OSDoc.APIDoc({onSuccess: noteCompletion.saturate('docs'), target: $('docs')}).load('functional.js');
    gEval = new Evaluator('#evaluator', {onUpdate: showEvaluator});
    initializeHeaderToggle();
    initializeTestLinks();
    ieMode();
    if (navigator.appName != 'Microsoft Internet Explorer')
        $$('#header pre').each('_.innerHTML = OSDoc.unindent(_.innerHTML)'.lambda());
    resetGradients();
    Event.observe(window, 'resize', scheduleGradientReset);
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
        var text = gDocs.getTestText();
        document.write('<pre>'+text.escapeHTML()+'</pre>');
    });
}

function noteCompletion(flag) {
    var flags = arguments.callee;
    flags[flag] = true;
    if (flags.docs && flags.examples) {
        $('noscript').hide();
        $('evaluator').show();
        var inputs = $$('kbd');
        gEval.makeClickable(inputs);
        if (window.location.search.match(/[\?&]test\b/)) {
            var results = gDocs.runTests();
            alert(results.toHTML());
        }
        scheduleGradientReset();
    }
}


function ieMode() {
    if (navigator.appName != 'Microsoft Internet Explorer') return;
    window.resetGradient = Functional.I;
    var e = $('ie-warning');
    e.show();
    Event.observe($$('#ie-warning .close')[0], 'click', e.hide.bind(e).saturate());
}


/*
 * Gradients
 */

var scheduleGradientReset = (function() {
    var resizer;
    return function() {
        resizer = resizer || window.setTimeout(function() {
            resizer = null;
            resetGradients();
        }, 60);
    }
})();

function resetGradients() {
    resetGradient('intro', 0xeeeeff);
    if ($('evaluator').style.display != 'none')
        resetGradient('evaluator', 0xeeffee, 0xddffdd);
}

function resetGradient(name, startColor, endColor) {
    if (arguments.length < 3) endColor = 0xffffff;
    var parent = $(name);
    var old = ($A(parent.childNodes).select('.className=="grad"'.lambda()));
    old.each(parent.removeChild.bind(parent));
    var children = $A(parent.childNodes).slice(0);
    OSGradient.applyGradient({'gradient-start-color': startColor,
                              'gradient-end-color': endColor,
                              'border-radius': 15},
                             parent);
    var newed = $A(parent.childNodes).reject(children.include.bind(children));
    newed.each('.className="grad"'.lambda());
}

Event.observe(window, 'load', initialize);
