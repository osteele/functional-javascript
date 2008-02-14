/* 
 * Author: Oliver Steele
 * Copyright: Copyright 2007-2008 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/functional
 * Created: 2007-07-15
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
    this.setShowTranscript(elements.transcript.toggle.checked);
    $(elements.transcript.controls).hide();
    this.recenterButton();
    
    function setElements(table, paths) {
        $H(paths).each(function(item) {
            var path = rootName+' '+item.value;
            var elt = table[item.key] = $(path)[0];
            elt || console.error("Couldn't find $('"+path+'")');
        });
    }
}

Evaluator.prototype.setShowTranscript = function(visible) {
    var elements = this.elements;
    $([elements.transcript.input, elements.transcript.output, elements.transcript.clear]).invoke(visible ? 'show' : 'hide');
    this.transcript = visible;
}

Evaluator.prototype.observeElements = function() {
    var self = this,
        eval = this.eval.bind(this).saturate(),
        elements = this.elements,
        transcript = elements.transcript;
    $(transcript.toggle).click(function() {
        this.setShowTranscript(transcript.toggle.checked);
        this.recenterButton();
    }.bind(this));
    $(transcript.clear).click(function() {
        // should unobserve the vanished elements, but I don't
        // think it matters for interactive use
        $([transcript.input, transcript.output, transcript.count]).html('');
        transcript.controls.hide();
        this.recenterButton();
    }.bind(this));
    $(elements.input).keyup(function(e) {
        if (e.keyCode == 13) {
            eval();
            return false;
        }
    }.bind(this));
    $(elements.evalButton).click(eval);
}

Evaluator.prototype.eval = function(textOrNode) {
    var elements = this.elements,
        inputElement = elements.input,
        outputElement = elements.output,
        transcriptElements = elements.transcript;
    var text = arguments.length < 1
        ? inputElement.value.strip().replace('\n', '')
        : typeof textOrNode == 'string'
        ? textOrNode
        : $(textOrNode).text()
    inputElement.value = text;
    Evaluator.scope = this.scope = this.scope || {};
    text = text.replace(/^\s*var\s+/, 'Evaluator.scope.');
    text = text.replace(/^\s*function\s+([A-Z_$][A-Z_$\d]*)/i, 'Evaluator.scope.$1 = function');
    var value, error;
    try {
        with (Evaluator.scope)
            value = eval(text);
    } catch (e) {
        error = e;
    }
    var html = error ? 'Error: ' + error : Evaluator.toString(value).escapeHTML();
    $(elements.root).invoke(error ? 'addClass' : 'removeClass', 'error');
    outputElement.innerHTML = html;
    if (this.lastRecord) {
        function update(elt, text) {
            elt.innerHTML = elt.innerHTML ? elt.innerHTML + '\n' + text : text;
        }
        //update(transcriptElements.input, this.lastRecord.input.escapeHTML());
        var e = document.createElement('div');
        e.innerHTML = '<kbd>' + this.lastRecord.input + '</kbd>';
        transcriptElements.input.appendChild(e);
        this.makeClickable(e);
        update(transcriptElements.output, '<samp>' + this.lastRecord.output + '</samp>');
        if (this.enableTranscript)
            $([transcriptElements.controls, transcriptElements.clear]).show();
        var count = 1 + (parseInt(transcriptElements.count.innerHTML)||0);
        transcriptElements.count.innerHTML = ''+count;
        this.recenterButton();
    }
    this.lastRecord = {input: text, output: html};
    this.options.onUpdate && this.options.onUpdate();
    return value;
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
    var oc = this.elements.output.parentNode;
    oc.style.minHeight = $(this.elements.input.parentNode).height()
        - parseInt(oc.style.paddingTop || 0)
        - parseInt(oc.style.paddingBottom || 0)
        + 'px';
    var button = this.elements.evalButton;
    var heights = map('$(_).height()', [this.elements.input, this.elements.output, button]);
    var max = Math.max(heights[0], heights[1]);
    var y = Math.floor((max - heights[2]) / 2) + 10;
    if (this.transcript)
        y += $(this.elements.transcript.input).height();
    button.style.marginTop = y + 'px';
}

Evaluator.prototype.makeClickable = function(elt) {
    $(elt).click(function() {
        var text = elt.innerHTML.unescapeHTML();
        gEval.eval(text);
    });
}
