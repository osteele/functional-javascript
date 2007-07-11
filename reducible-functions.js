/*
Agenda:
- fix bug
- compose -> composen
- parse reduction strings
- add identity
- trace to html page
- literacy
- another example? Function.bind, Function.curry
*/

var info = window.console && window.console.info || function(){};

Function.defineAlgebra = function(target, options) {
    var ops = {};
    var methodNames = options.methods;
    var simplify = options.simplify;
    for (var ix in methodNames) {
        var name = methodNames[ix];
        var basefn = target[name];
        (function(name, basefn) {
            target[name] = function() {
                var fn = basefn.apply(this, arguments);
                attachSuccessors(fn, {name: name, args: [].slice.call(arguments, 0)});
                return fn;
            }
            ops[name] = function() {
                return build(this, this.desc, name, [].slice.call(arguments, 0));
            }
        })(name, basefn);
    }
    function attachSuccessors(fn, desc) {
        fn.desc = desc;
        for (var p in ops)
            if (!(p in {}))
                fn[p] = ops[p];
    }
    function build(fn0, desc0, name, args) {
        var desc = {name: name, args: args};
        var expr = simplify([desc0, desc]);
        if (!expr) {
            var fn = compose(fn0, target[name].apply(null, args));
        } else {
            var fn = make(expr);
            desc = expr[0]; // FIXME
        }
        attachSuccessors(fn, desc);
        return fn;
    }
    function make(expr) {
        expr = expr[0];
        var methodName = expr.name;
        return target[methodName].apply(methodName, expr.args);
    }
}

function compose() {
    var fns = [].slice.call(arguments, 0);
    return function() {
        for (var i = fns.length; --i >= 0; )
            arguments = fns[i].apply(this, arguments);
        return arguments;
    }
}

// info(compose(function(a){return a+1}, function(a){return a*2})(3));
// info(compose(function(a){return a*2}, function(a){return a+1})(3));

var Linear = {};

Linear.scalor = function(sx, sy) {
    return function(x, y) {
        info('scale', x, y, 'by', sx, sy);
        return [sx*x, sy*y];
    }
}

Linear.translator = function(tx, ty) {
    return function(x, y) {
        info('translate', x, y, 'by', tx, ty);
        return [tx + x, ty + y];
    }
}

Function.defineAlgebra(Linear, {
    methods: ['scalor', 'translator'],
    reduce: [
        'scalor(x0,y0).scalor(x1,y1)->scalor(x0*x1,y0*y1)',
        'translator(x0,y0).translator(x1,y1)->translator(x0+x1,y0+y1)',
    ],
    simplify: function(ops) {
        if (ops.length == 2) {
            var op1 = ops[0];
            var op2 = ops[1];
            if (op1.name == 'scalor' && op2.name == 'scalor')
                return [{name: 'scalor', args: [op1.args[0] * op2.args[0],
                                                op1.args[1] * op2.args[1]]}];
            if (op1.name == 'translator' && op2.name == 'translator')
                return [{name: 'translator', args: [op1.args[0] + op2.args[0],
                                                    op1.args[1] + op2.args[1]]}];
        }
    }
});

// info(Linear.scalor(2, 3).scalor(5,7)(10, 20));
// info(Linear.translator(2, 3).translator(5,7)(10, 20));
// info(Linear.translator(2, 3).translator(5,7).translator(100,200)(10, 20));
// info(Linear.translator(2, 3).scalor(5,7)(10, 20));

// info(Linear.translator(2,3).translator(2, 3).scalor(5,7)(10, 20));
info(Linear.translator(2,3).scalor(5,7).scalor(10,5)(10, 20));

//info(Linear.translator(2,3).translator(2, 3).scalor(5,7).scalor(10,5)(10, 20));
