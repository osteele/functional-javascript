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
    shoe();
}

function shoe() {
        //OSGradient.applyGradient({'gradient-start-color':0xccffcc,'gradient-end-color':0xffffff, 'border-radius': 5}, );
        //OSGradient.applyGradient({'gradient-start-color':,'gradient-end-color':0xffffff, 'border-radius': 5}, $$('table')[0]);
    $('evaluator').style.display != 'none' && foot('evaluator', 0xeeffee);
    foot('intro', 0xeeeeff);
}

function foot(name, color) {
    var elt = $$('#'+name+' .gradient')[0];
    if (!elt) {
        elt = document.createElement('div');
        elt.className = 'gradient';
        elt.style.width = elt.style.height = '100%';
        elt.style.position = 'absolute';
        elt.style.padding = '-5px';
        var parent = $(name);
        parent.style.position = 'relative';
        parent.insertBefore(elt, parent.firstChild);
    }
    elt.innerHTML = '';
    //elt.style.height = Element.getHeight($(name));
    //info(name, Element.getHeight(name));
    OSGradient.applyGradient({'gradient-start-color': color,
                              'gradient-end-color': 0xffffff,
                              'border-radius': 5},
                             elt);
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
        var resizer;
        window.onresize = function() {
            resizer = resizer || window.setTimeout(function() {
                resizer = null;
                shoe();
            }, 60);
        }
        window.onresize();
    }
}



Event.observe(window, 'load', initialize);
