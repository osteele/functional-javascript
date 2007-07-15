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
var trace = info;

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
    gExamples = OSDoc.Examples.load('functional-examples.js').onSuccess(done.saturate('examples')).replace($('output'));
    gDocs = new OSDoc.Docs({onLoad: function() {
        gDocs.replace($('docs'));
        done('docs');
    }});
    gDocs.load('functional.js');
    gEval = new EvalWorksheet('cin', 'cout', 'ceval');
    makeTogglePair('hide-header', 'show-header', 'header');
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
    function makeToggler(button, complement, action) {
        Event.observe(button, 'click', function(e) {
            Event.stop(e);
            Element.hide(button);
            Element.show(complement);
            action();
        });
    }
    function makeTogglePair(hider, shower, target) {
        makeToggler(hider, shower, Element.hide.bind(Element, target));
        makeToggler(shower, hider, Element.show.bind(Element, target));
    }
}

function EvalWorksheet(cin, cout, button) {
    this.cin = $(cin);
    this.cout = $(cout);
    this.button = $(button);
    this.observe();
}

EvalWorksheet.prototype.observe = function() {
    Event.observe(this.cin, 'keyup', function(e) {
        if (e.keyCode == 13) {
            this.eval();
            Event.stop(e);
        }
    }.bind(this));
    Event.observe(this.button, 'click', this.eval.bind(this));
}

var gg = {};
EvalWorksheet.prototype.eval = function() {
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
    //window.location = '#cin';
}

function done(name) {
    var me = arguments.callee;
    me[name] = true;
    if (me.docs && me.examples) {
        $('noscript').hide();
        function handler(e) {
            var text = Event.element(e).innerHTML.unescapeHTML();
            $('cin').value = text;
            gEval.eval();
        }
        map(Event.observe.bind(Event).partial(_, 'click', handler), $$('.input'));
    }
}

Event.observe(window, 'load', initialize);
