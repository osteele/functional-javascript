/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional.html
 * Source: http://osteele.com/javascripts/functional-examples.js
 * Created: 2007-07-11
 * Modified: 2007-07-15
 */

var info = window.console && console.info || function(){};

Function.prototype.reporting = function() {
    var fn = this;
    return function() {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            info(e);
            throw e;
        }
    }
}

// debugging references
var gExamples, gDocs;

var gEval;

function initialize() {
    gExamples = new OSDoc.Examples({onLoad: done.saturate('examples'), target: $('output')}).load('examples.js');
    gDocs = new OSDoc.APIDoc({onLoad: done.saturate('docs'), target: $('docs')}).load('functional.js');
    gEval = new Evaluator('cin', 'cout', 'ceval');
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

function Evaluator(cin, cout, button) {
    this.cin = $(cin);
    this.cout = $(cout);
    this.button = $(button);
    this.lastRecord = null;
    this.observe();
    $F('toggle-transcript') || this.setShowTranscript(false);
    $('transcript-controls').hide();
}

Evaluator.prototype.setShowTranscript = function(visible) {
    $$('#cinup .transcript', '#coutup .transcript', '#clear-transcript').invoke(visible ? 'show' : 'hide');
    this.transcript = visible;
}

Evaluator.prototype.observe = function() {
    Event.observe('toggle-transcript', 'click', function() {
        this.setShowTranscript($F('toggle-transcript'));
    }.bind(this));
    Event.observe('clear-transcript', 'click', function() {
        $$('#cinup .transcript')[0].innerHTML = '';
        $$('#coutup .transcript')[0].innerHTML = '';
        $('transcript-controls').hide();
    });
    Event.observe(this.cin, 'keyup', function(e) {
        if (e.keyCode == 13) {
            this.eval();
            Event.stop(e);
        }
    }.bind(this));
    Event.observe(this.button, 'click', this.eval.bind(this));
}

Evaluator.prototype.eval = function() {
    var text = this.cin.value = this.cin.value.strip().replace('\n', '');
    text = text.replace(/^\s*var\s+/, '');
    text = text.replace(/^\s*function\s+([A-Z_$][A-Z_$\d]*)/i, '$1 = function');
    var html;
    try {
        var value;
        value = eval(text);
        html = OSDoc.toString(value).escapeHTML();
    } catch (e) {
        html = 'Error: ' + e;
    }
    this.cout.innerHTML = html;
    if (this.lastRecord) {
        function update(elt, text) {
            elt.innerHTML = elt.innerHTML ? elt.innerHTML + '\n' + text : text;
        }
        update($$('#cinup .transcript')[0], this.lastRecord.input.escapeHTML());
        update($$('#coutup .transcript')[0], this.lastRecord.output);
        $('transcript-controls').show();
        $('clear-transcript').show();
    }
    this.lastRecord = {input: text, output: html};
    //window.location = '#cin';
}

Evaluator.prototype.makeClickable = function(elements) {
    function handler(e) {
        var text = Event.element(e).innerHTML.unescapeHTML();
        $('cin').value = text;
        gEval.eval();
    }
    map(Event.observe.bind(Event).partial(_, 'click', handler), elements);
}

function done(flag) {
    var callee = arguments.callee;
    callee[flag] = true;
    if (callee.docs && callee.examples) {
        $('noscript').hide();
        gEval.makeClickable($$('.input'));
        window.location.search.match(/[\?&]test\b/) &&
            gDocs.runTests();
    }
}

Event.observe(window, 'load', initialize);
