/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Created: 2007-07-15
 * Modified: 2007-07-16
 */

Functional.install();

function Evaluator(rootName, options) {
    this.options = options || {};
    this.enableTranscript = 'transcript' in options ? options.transcript : true;
    var elements = this.elements = {transcript:{}};
    setElements(elements, {
        root: '',
        input: '.input-column .current',
        output: '.output-column .current',
        evalButton: '.eval-button'
    });
    setElements(elements.transcript, {
        controls: '.transcript-controls',
        toggle: '.transcript-controls .toggle',
        clear: '.transcript-controls .clear',
        count: '.transcript-controls .count',
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
        transcript.count.innerHTML = '';
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
    var elements = this.elements;
    var inputElement = elements.input;
    var outputElement = elements.output;
    var transcriptElements = elements.transcript;
    if (arguments.length < 1)
        var text = inputElement.value.strip().replace('\n', '');
    inputElement.value = text;
    Evaluator.scope = this.scope = this.scope || {};
    text = text.replace(/^\s*var\s+/, 'Evaluator.scope.');
    text = text.replace(/^\s*function\s+([A-Z_$][A-Z_$\d]*)/i, 'Evaluator.scope.$1 = function');
    var html;
    var value, error;
    try {
        with (Evaluator.scope)
            value = eval(text);
    } catch (e) {
        error = e;
    }
    [elements.root].invoke(error ? 'addClassName' : 'removeClassName', 'error');
    html = error ? 'Error: ' + error : Evaluator.toString(value).escapeHTML();
    outputElement.innerHTML = html;
    if (this.lastRecord) {
        function update(elt, text) {
            elt.innerHTML = elt.innerHTML ? elt.innerHTML + '\n' + text : text;
        }
        //update(transcriptElements.input, this.lastRecord.input.escapeHTML());
        var e = document.createElement('div');
        e.innerHTML = '<kbd>' + this.lastRecord.input + '</kbd>';
        transcriptElements.input.appendChild(e);
        this.makeClickable([e]);
        update(transcriptElements.output, '<samp>' + this.lastRecord.output + '</samp>');
        if (this.enableTranscript) {
            transcriptElements.controls.show();
            transcriptElements.clear.show();
        }
        var count = 1 + (parseInt(transcriptElements.count.innerHTML)||0);
        transcriptElements.count.innerHTML = ''+count;
        this.recenterButton();
    }
    this.lastRecord = {input: text, output: html};
    this.options.onUpdate && this.options.onUpdate();
}

Evaluator.toString = function(value) {
    if (value instanceof Array) {
        var spans = map(Evaluator.toString, value);
        return '[' + spans.join(', ') + ']';
    }
    switch (typeof(value)) {
    case 'function': return 'function()';
    case 'string': return '"' + value + '"';
    default: return value ? value.toString() : ''+value;
    }
}

// I'm not smart enough to figure out how to do this in CSS.
// This won't keep up with some display change, but oh well.
Evaluator.prototype.recenterButton = function() {
    return;
    var button = this.elements.evalButton;
    var heights = map('Element.getHeight(_)', [this.elements.input, this.elements.output, button]);
    var max = Math.max(heights[0], heights[1]);
    var y = Math.floor((max - heights[2]) / 2) + 10;
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

