	//this.addEdges(gradientElement, width, height);

// incomplete and unused
OSGradient.prototype.addEdges = function(parent) {
	var style = this.style;
    var c0 = style['gradient-start-color'];
    var c1 = style['gradient-end-color'];
	var height = this.height;
	var r = this.r;
	
	var spans = [];
	var xs = [];
	for (var y = 0; y <= r; y += 0.25) {
		var x = this.computeX(y);
		xs.push(x);
		if (xs.length < 5) continue;
		info(y, xs);
		xs.sort(function(a,b){return a-b});
		// Each span x0:x1 accumulates:
		// floor(x0):floor(x0)+1: (floor(x0)+1-x0)/4
		// floor(x0)+1:... : 1/4
		//
		// structure: [x0,alpha]
		// each x is a transition point at which 1/4 is added
		// if the next x is greater, then render at that alpha
		// from the cursor until the next x
		var x0 = xs[0];
		var alpha = 0;
		/*for (var i = 1; i < xs.length; i++) {
			alpha += .25;
			var x1 = xs[i];
			if (Math.floor(*/
		var xmin = Math.floor(xs[0]);
		var xmax = Math.ceil(xs[xs.length-1]);
		var color = OSUtils.color.interpolate(c0, c1, y/height);
		var alpha = 0.125;
		color = OSUtils.color.interpolate(0xffffff, color, alpha);
		spans.push(this.makeSpan(xmin, y-1, xmax-xmin, 1, color));
		ReadableLogger.defaults.stringLength=null;
		xs = [x];
	}
	
	var corner = document.createElement('div');
	corner.innerHTML = spans.join('');
	corner.style.position='absolute';
	corner.style.left='0px';
	corner.style.top='0px';
	
	parent.insertBefore(corner, parent.childNodes[0]);
};

