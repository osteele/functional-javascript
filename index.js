/* Copyright 2007 by Oliver Steele.  Available under the MIT License. */

var gEvaluator;

$(function() {
    new DocViewer({api:['functional.js', 'to-function.js'],
                   examples:'examples.js',
                   onLoad:loaded});
    function loaded() {
        gEvaluator = new Evaluator('#evaluator', {onUpdate: showEvaluator});
        ieMode();
        if (navigator.appName != 'Microsoft Internet Explorer')
            $('#header pre').each(function() {
                this.innerHTML = OSUtils.unindent(this.innerHTML);
            });
        $('#evaluator').show();
        resetGradients();
        $(window).resize(scheduleGradientReset);
        $('.protodoc kbd').click(function() {
            gEvaluator.eval($(this).text());
            $.scrollTo($('#evaluator'), {speed:1000});
        });
        $('.example kbd').click(function() {
            gEvaluator.eval($(this).text());
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
