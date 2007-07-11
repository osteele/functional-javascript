/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  Homepage: http://osteele.com/sources/javascript/
  Docs: http://osteele.com/sources/javascript/docs/bezier
  Download: http://osteele.com/sources/javascript/bezier.js
  Example: http://osteele.com/sources/javascript/bezier-demo.html
  License: MIT License.
  
  +bezier.js+ is a library for measuring and subdividing arbitrary-order
  Bezier curves.
  
  Points are represented as <tt>{x: x, y: y}</tt>.
  
  == Usage
    var bezier = new Bezier[({x:0,y:0}, {x:50,y:50}, {x:100,y:25}]);
    bezier.draw(context);
    var order = bezier.order;
    var left = bezier.split()[0];
    var right = bezier.split()[1];
    var length = bezier.measureLength(bezier);
    var midpoint = bezier.atT(0.5); // parametric, not length
  
  == Related
  Also see {<tt>path.js</tt>}[http://osteele.com/sources/javascript/docs/path].
 */

// Construct an nth-order bezier, where n == points.length.
// This aliases its argument.
function Bezier(points) {
    this.points = points;
    this.order = points.length;
};

// Return an array of coefficients to the nth-order Bernstein
// polynomial.
Bezier.getCoefficients = function(order) {
    var table = Bezier._coefficientTable;
    var coefficients = table[order];
    if (coefficients) return coefficients;
    for (var i = table.length-1; i < order; i++) {
        var last = table[i];
        var next = [1];
        for (var j = 0; j < i-1; j++)
            next.push(last[j] + last[j+1]);
        next.push(1);
        table.push(next);
    }
    return next;
};

// Used by getCoefficients.
Bezier._coefficientTable = [[1]];

// Return the linear distance between two points.
function distance(p0, p1) {
    var dx = p1.x - p0.x;
    var dy = p1.y - p0.y;
    return Math.sqrt(dx*dx + dy*dy);
};

// Return the Schneider triangle of successive midpoints.
// The left and right edges are the points of the two
// Beziers that split this one at the midpoint.
Bezier.prototype._triangle = function () {
    var upper = this.points;
    var m = [upper];
    // fill the triangle
    for (var i = 1; i < this.order; i++) {
        var lower = [];
        for (var j = 0; j < this.order - i; j++) {
            var c0 = upper[j];
            var c1 = upper[j+1];
            lower[j] = {x: (c0.x + c1.x)/2,
                        y: (c0.y + c1.y)/2};
        }
        m.push(lower);
        upper = lower;
    }
    this._triangle = function () {return m};
    return m;
}
    
// Return two shorter-length beziers of the same order that union to
// the same locus and intersect at Bezier.atT(0.5).
Bezier.prototype.split = function () {
    var m = this._triangle();
    var left = new Array(this.order), right = new Array(this.order);
    for (var i = 0; i < this.order; i++) {
        left[i]  = m[i][0];
        right[i] = m[this.order-1-i][i];
    }
    return [new Bezier(left), new Bezier(right)];
};

// Return the midpoint on t.  This isn't generally the linear
// midpoint.
Bezier.prototype.midpointT = function () {
    return this.atT(.5);
};

// Add functions here to optimize atT for specific orders.
Bezier.prototype.atT_n = {};
Bezier.prototype.atT_n[4] = function(t) {
    var p = this.points;
    var t2 = t*t;
    var t3 = t2*t;
    var u = 1-t;
    var u2 = u*u;
        var u3 = u2*u;
    return {x: p[0].x*u3 + 3*p[1].x*t*u2 + 3*p[2].x*t2*u + p[3].x*t3,
            y: p[0].y*u3 + 3*p[1].y*t*u2 + 3*p[2].y*t2*u + p[3].y*t3};
}

// Return the point at t along the curve.
Bezier.prototype.atT = function(t) {
    var fastfn = this.atT_n[this.order];
    if (fastfn) return fastfn.call(this, t);
    var p = this.points;
    var cs = Bezier.getCoefficients(this.order);
    var u = 1-t, un = 1;
    var uns = [];
    for (var i = 0; i < this.order; i++) {
        uns.push(un);
        un *= u;
    }
    var x = 0, y = 0, tn = 1;
    for (var i = 0; i < this.order; i++) {
        var c = cs[i] * uns.pop() * tn;
        x += c * p[i].x;
        y += c * p[i].y;
        tn *= t;
    }
    return {x: x, y: y};
};

// Return the length of the polynomial.  This is an approximation to
// within error, which defaults to 1.  (It actually stops subdividing
// when the length of the polyline is within error of the length
// of the chord.)
Bezier.prototype.measureLength = function (error) {
    var sum = 0;
    var queue = [this];
    if (arguments.length < 1) error = 1;
    do {
        var b = queue.pop();
        var points = b.points;
        var chordlen = distance(points[0], points[this.order-1]);
        var polylen = 0;
        for (var i = 0; i < this.order-1; i++)
            polylen += distance(points[i], points[i+1]);
        if (polylen - chordlen <= error)
            sum += polylen;
        else
            queue = queue.concat(b.split());
    } while (queue.length);
    this.measureLength = function () {return sum};
    return sum;
};

Bezier.prototype.draw = function (ctx) {
	var pts = this.points;
	ctx.moveTo(pts[0].x, pts[0].y);
	var fn = Bezier.drawCommands[this.order];
	if (fn) {
		var coordinates = [];
		for (var i = pts.length ? 1 : 0; i < pts.length; i++) {
			coordinates.push(pts[i].x);
			coordinates.push(pts[i].y);
		}
		fn.apply(ctx, coordinates);
	} else
		error("don't know how to draw an order *" + this.order + " bezier");
};

// These use wrapper functions as a workaround for Safari.  In Safari,
// fn.apply doesn't work for primitives (as of 2006/03/01).
Bezier.drawCommands = [
    // 0: will have errored on the moveTo
    null,
    // 1
    // this will have an effect if there's a thickness or end cap
    function (x,y) {this.lineTo(x,y)},
    // 2
    function(x,y) {this.lineTo(x,y)},
    // 3
    function(x1,y1,x2,y2) {this.quadraticCurveTo(x1,y1,x2,y2)},
    // 4
    function(x1,y1,x2,y2,x3,y3) {this.bezierCurveTo(x1,y1,x2,y2,x3,y3)}
                       ];
