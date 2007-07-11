/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  Homepage: http://osteele.com/sources/javascript
  License: MIT License.
*/

// lift js into a functional language...
Array.map = function (ar, f) {
	var results = [];
	for (var i = 0; i < ar.length; i++)
        results.push(f(ar[i], i));
	return results;
};

Array.each = Array.map;

Array.partition = function (ar, n) {
	var partitions = [];
	var partition;
	Array.map(ar, function (item, i) {
			if (i % n == 0) partitions.push(partition = []);
			partition.push(item);
		});
	return partitions;
};

function range(start, stop, interval) {
    return {each: function (fn) {
            for (var i = start; i < stop; i += interval)
                fn(i);}};
}

var gMargin = 3;
var rowHeight = 60;

// easy to type, cumbersome to use...
var gPathData = [
	[0,5, 100,20],
	[0,20, 50,50, 100,0],
	[0,0, 20,25, 80,75, 100,10]];

// so turn them into {x: y:} lists, and adjust the ranges
var gPoints = Array.map(
	gPathData,
	function (pts, i) {
		return Array.map(Array.partition(pts, 2),
						 function (item) {
							 return {x: item[0], y: item[1]}})});

// and make some Beziers:
var gBeziers = Array.map(gPoints, function(pts) {return new Bezier(pts)});

// translate them
Array.map(gBeziers, function(bezier, i) {
		bezier.points = Array.map(bezier.points, function (pt) {
				return {x: 3*pt.x + gMargin, y: pt.y + i * rowHeight + gMargin}})});

// turn them into paths
var gPaths = Array.map(gBeziers, function(bezier) {
		return new Path([bezier])});

// and finally a path that strings them all together
var catPath = new Path();
Array.map(gPoints, function (points, i) {
		var pts = Array.map(points, function (pt) {
				return {x: 3*(100*i+pt.x)/gBeziers.length + gMargin,
                        y: pt.y+rowHeight*gBeziers.length + gMargin}});
		catPath.addBezier(new Bezier(pts));
    });
gPaths.push(catPath);

function drawBeziers(ctx) {
    // draw the grid
	ctx.beginPath();
	range(0, 300+1, 20).each(function (x) {
            ctx.moveTo(x+gMargin, 0+gMargin);
            ctx.lineTo(x+gMargin, 240+gMargin);
        });
	range(0, 240+1, 20).each(function (y) {
            ctx.moveTo(0+gMargin, y+gMargin);
            ctx.lineTo(300+gMargin, y+gMargin);
		});
	ctx.strokeStyle = 'blue';
	ctx.globalAlpha = 0.25;
	ctx.stroke();
	
    // draw the paths
	ctx.beginPath();
	Array.each(gPaths, function (path) {path.draw(ctx)});
	ctx.lineWidth = 2;
	ctx.globalAlpha = 1;
	ctx.strokeStyle = 'black';
	ctx.stroke();
	
	// draw the tangents
	ctx.beginPath();
	Array.each(gBeziers, function (bezier) {
			if (bezier.order > 2) {
				var pts = bezier.points;
				ctx.moveTo(pts[0].x, pts[0].y);
				ctx.lineTo(pts[1].x, pts[1].y);
				ctx.moveTo(pts[pts.length-2].x, pts[pts.length-2].y);
				ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
			}
        });
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'blue';
	ctx.stroke();
	
	// draw the control points
	Array.each(gBeziers, function (bezier) {
			Array.each(bezier.points, function (pt) {
					ctx.beginPath();
					ctx.arc(pt.x, pt.y, 3, 0, 2*Math.PI, true);
					ctx.fillStyle = 'green';
					ctx.fill();
				})});
}
	
function drawBezierSamples(ctx, t) {
	Array.each(gPaths, function (path) {
			var pt = path.atT(t);
			ctx.beginPath();
			ctx.arc(pt.x, pt.y, 3, 0, 2*Math.PI, true);
			ctx.fillStyle = 'red';
			ctx.fill();
		});
}
