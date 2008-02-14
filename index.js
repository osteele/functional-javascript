/* Copyright 2007-2008 by Oliver Steele.  Available under the MIT License. */

$(function() {
    new DocViewer({api:['functional.js', 'to-function.js'],
                   examples:'examples.js',
                   onLoad:loaded});
    function loaded() {
        var evaluator = new Evaluator('#evaluator', {onUpdate: showEvaluator});
        ieMode();
        if (navigator.appName != 'Microsoft Internet Explorer')
            $('#header pre').each(function() {
                this.innerHTML = OSUtils.unindent(this.innerHTML);
            });
        $('#evaluator').show();
        resetGradients();
        $(window).resize(scheduleGradientReset);
        $('.example kbd').click(function() { evaluator.eval(this) });
        $('.protodoc kbd').click(function() {
            var value = evaluator.eval(this);
            typeof value == 'undefined' ||
                $.scrollTo($('#evaluator'), {speed:1000});
        });
    }
});

function showEvaluator() {
    $('header').show()
    resetGradients();
}

function ieMode() {
    if (navigator.appName != 'Microsoft Internet Explorer') return;
    window.resetGradient = Functional.I;
    var e = $('ie-warning');
    e.show();
    $('#ie-warning .close').click(function() {this.hide});
}

// Emulate enough of Prototype for the example to work
var Event = {
    observe: function(elt, handlerName, handler) {
        var e = $(typeof elt == 'string' ? '#' + elt : elt);
        e[handlerName].call(e, handler);
    }
}
