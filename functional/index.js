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
    gEval = new Evaluator('#evaluator');
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

function Evaluator(rootName) {
    var elements = this.elements = {transcript:{}};
    setElements(elements, {
        input: '.input-column .current',
        output: '.output-column .current',
        evalButton: '.eval-button'
    });
    setElements(elements.transcript, {
        controls: '.transcript-controls',
        toggle: '.transcript-controls .toggle',
        clear: '.transcript-controls .clear',
        input: '.input-column .transcript',
        output: '.output-column .transcript'
       });
    
    this.lastRecord = null;
    this.observeElements();
    this.setShowTranscript($F(elements.transcript.toggle));
    $(elements.transcript.controls).hide();
    this.recenterButton();
    function setElements(table, paths) {
        $H(paths).each(function(item) {
            var path = rootName+' '+item[1];
            var elt = table[item[0]] = $$(path)[0];
            elt || console.error("Couldn't find $$('"+path+'")');
        });
    }
}

Evaluator.prototype.setShowTranscript = function(visible) {
    var elements = this.elements;
    [elements.transcript.input, elements.transcript.output, elements.transcript.clear].invoke(visible ? 'show' : 'hide');
    this.transcript = visible;
}

Evaluator.prototype.observeElements = function() {
    var elements = this.elements;
    var transcript = elements.transcript;
    Event.observe(transcript.toggle, 'click', function() {
        this.setShowTranscript($F(transcript.toggle));
        this.recenterButton();
    }.bind(this));
    Event.observe(transcript.clear, 'click', function() {
        // should unobserve the vanished elements, but I don't
        // think it matters for interactive use
        transcript.input.innerHTML = '';
        transcript.output.innerHTML = '';
        transcript.controls.hide();
        this.recenterButton();
    }.bind(this));
    Event.observe(elements.input, 'keyup', function(e) {
        if (e.keyCode == 13) {
            this.eval();
            Event.stop(e);
        }
    }.bind(this));
    Event.observe(elements.evalButton, 'click', this.eval.bind(this).saturate());
}

Evaluator.prototype.eval = function(text) {
    var inputElement = this.elements.input;
    var outputElement = this.elements.output;
    var transcriptElements = this.elements.transcript;
    if (arguments.length < 1)
        var text = inputElement.value.strip().replace('\n', '');
    inputElement.value = text;
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
    outputElement.innerHTML = html;
    if (this.lastRecord) {
        function update(elt, text) {
            elt.innerHTML = elt.innerHTML ? elt.innerHTML + '\n' + text : text;
        }
        //update(transcriptElements.input, this.lastRecord.input.escapeHTML());
        var e = document.createElement('div');
        e.className = 'input';
        e.innerHTML = this.lastRecord.input;
        transcriptElements.input.appendChild(e);
        this.makeClickable([e]);
        update(transcriptElements.output, this.lastRecord.output);
        transcriptElements.controls.show();
        transcriptElements.clear.show();
        this.recenterButton();
    }
    this.lastRecord = {input: text, output: html};
}

// I'm not smart enough to figure out how to do this in CSS.
// This won't keep up with some display change, but oh well.
Evaluator.prototype.recenterButton = function() {
    var button = this.elements.evalButton;
    var heights = map('Element.getHeight(_)', [this.elements.input, this.elements.output, button]);
    var y = Math.floor((Math.max(heights[0], heights[1]) - heights[2]) / 2) + 10;
    if (this.transcript)
        y += Element.getHeight(this.elements.transcript.input);
    button.style.marginTop = y + 'px';
}

Evaluator.prototype.makeClickable = function(elements) {
    function handler(e) {
        var text = Event.element(e).innerHTML.unescapeHTML();
        gEval.eval(text);
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
