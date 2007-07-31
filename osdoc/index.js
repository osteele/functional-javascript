/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Created: 2007-07-11
 * Modified: 2007-07-16
 */

var info = window.console && console.info || function(){};

function initialize() {
    var src = (window.location.search.match(/[\?&]source=([^&]*)/)||{})[1];
    if (!src && !window.location.search.match(/[\?&]test\b/)) {
        $$('#noscript', 'table', '#header hr').invoke('hide');
        return;
    }
    src || new OSDoc.APIDoc({onSuccess: done.saturate('examples'), target: $('examples')}).load('osdoc.examples.js');
    src && Element.hide('examples-column');
    src && done('examples');
    new OSDoc.APIDoc({onSuccess: done.saturate('api'),
                      all: src,
                      target: $('docs')}).load(src || 'osdoc.apidoc.js');
    initializeHeaderToggle();
    initializeTestLinks();
}

function initializeHeaderToggle() {
    Event.observe('header-toggle', 'click', updateHeaderState);
    updateHeaderState();
    function updateHeaderState(e) {
        $$('#header').invoke($F('header-toggle') ? 'show' : 'hide');
    }
}

function initializeTestLinks() {
    info('disabled test links'); return;
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
        var inputs = $$('.input');
    }
}

Event.observe(window, 'load', initialize);
