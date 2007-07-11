/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  License: MIT License (Open Source)
  Homepage: http://osteele.com/sources/javascript
  Download: http://osteele.com/sources/javascript/gradients.js
  Docs: http://osteele.com/sources/javascript/docs/gradients
  Example: http://osteele.com/sources/javascript/demos/gradients.html
  Blog: http://osteele.com/archives/2006/03/javascript-gradient-roundrects
  Created: 2006-03-12
  Modified: 2006-03-20
  
  == Overview
  +gradients.js+ adds rounded rectangular gradients to a page,
  without the use of images.
  
  +gradients.js+ uses the +canvas+ tag if it is available.  Otherwise
  it creates the gradient through the use of +div+ tags.
  
  A gradient can be applied to an element procedurally, via JavaScript,
  or (with the use of the {DivStyle library}[http://osteele.com/sources/javascript/docs/divstyle])
  through the use of CSS embedded within an element's +div+ tags.
  
  == JavaScript API
  <tt>OSGradient.applyGradient(properties, element)</tt> applies
  a gradient to +element+.
  
  +properties+ is a hash of properties:
  * +gradient-start-color+: gradient start color (top); required
  * +gradient-end-color+: gradient end color (bottom); default white
  * +border-radius+: rounded corner radius; default zero
  
  Colors must be specified as the hex number +0xrrggbb+,
  e.g. +0xff0000+ for red.  (The Divstyle API, below, allows the use
  of symbolic color names.)  +border-radius+ must be specified as a
  Number of pixels, e.g. +25+ (not +25px+).
  
  === Usage
    <html>
      <head>
        <script type="text/javascript" src="gradients.js"></script>
      </head>
      <body>
        <div id="elt">Some text</div>
        <script type="text/javascript">
          var elt = document.getElementById('elt');
          var style = {'gradient-start-color': 0x0000ff,
                       'border-radius': 25};
          OSGradient.applyGradient(style, elt);
        </script>
      </body>
    </html>
  
  === DivStyle API
  If the +divstyle.js+ and +behaviour.js+ files are included, you can
  also specify a gradient using CSS syntax inside a +div+ tag with
  class +style+.  CSS selectors within the div style can select
  multiple tags, and multiple selectors can add properties to a single
  element.
  
  +divstyle.js+ is available from http://osteele.com/sources/javascript/.
  +behaviour.js+ is available from http://bennolan.com/behaviour/.
  (That's the British spelling of "behaviour".)
  
  === Usage
    <html>
      <head>
        <script type="text/javascript" src="behaviour.js"></script>
        <script type="text/javascript" src="divstyle.js"></script>
        <script type="text/javascript" src="gradients.js"></script>
        <style type="text/css">
          .style {display: none}
          #red, .blue-grade {width: 100px}
        </style>
      </head>
      <body>
        <div class="style">
          #red {gradient-start-color: red}
          .blue-grade {gradient-start-color: blue}
          .rounded {border-radius: 10}
        </div>
        
        <div id="red">Red</div>
        <div class="blue-grade">Blue...</div>
        <div class="blue-grade rounded">...rounded</div>
      </body>
    </html>
  
  === Limitations
  The +style+ div can contain a subset of CSS syntax.  This
  subset is described in the {documentation for <div>divstyle.js</div>}[http://osteele.com/sources/javascript/docs/divstyle].
*/

/*
 * Gradient package
 */
function OSGradient() {
	this.initialize.apply(this, arguments);
}

OSGradient.applyGradient = function(style, element) {
	var gradient = new OSGradient(style);
	gradient.applyGradient(element);
};

// Create a gradient for each element that has a divStyle.
// +divstyle.js+ sets the divStyles automatically.  This function does
// nothing if +divstyle.js+ has not been loaded, unless JavaScript
// code has explicitly set the +divStyle+ properties of any HTML
// Elements.
OSGradient.applyGradients = function() {
	try {DivStyle.initialize()} catch(e) {}
    var elements = document.getElementsByTagName('*');
    for (var i = 0, e; e = elements[i++]; ) {
        var style = e.divStyle;
        if (style && style.gradientStartColor)
            OSGradient.applyGradient(style, e);
    }
};

// Number of bands necessary for a smooth gradient, by component.
// The max of the color range and height are pinned to this.
OSGradient.maxBands = [192, 192, 96];

// The following properties need to be set in order for style.zIndex
// to work in IE.  This function is called the first time that a
// gradient is attached to an element.
OSGradient.setBodyStyle = function() {
	OSGradient.setBodyStyle = function() {}
    var style = document.body.style;
    style.position = 'relative';
    style.left = 0;
    style.top = 0;
    style.zIndex = 0;
};

//
// Instance methods
//

OSGradient.prototype.initialize = function(style) {
	this.style = style;
};

OSGradient.prototype.applyGradient = function(e) {
    var width = e.offsetWidth, height = e.offsetHeight;
	var gradientElement = (this.createCanvasGradient(e, width, height) ||
						   this.createGradientElement(width, height));
    OSGradient.setBodyStyle();
	this.attachGradient(e, gradientElement);
};

OSGradient.prototype.createCanvasGradient = function(e, width, height) {
	var canvas = document.createElement('canvas');
	var ctx;
	// Return null if canvas isn't supported.  The caller will
	// fall back on divs.
	try {ctx = canvas.getContext('2d')} catch (e) {return null}
	
	// Safari requires the following prior to rendering
	e.appendChild(canvas);
	if (navigator.appVersion.match(/Konqueror|Safari|KHTML/))
		canvas.style.position = 'fixed';
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
	
	var style = this.style;
    var c0 = style['gradient-start-color'];
    var c1 = style['gradient-end-color'];
    var r = style['border-radius'];
	
	ctx.beginPath();
	ctx.moveTo(0,r);
	//arcTo() produces NS_ERROR_NOT_IMPLEMENT in Firefox 1.5; use arc() instead:
	//ctx.arcTo(0,0,r,0,r);
	ctx.arc(r,r,r,Math.PI,-Math.PI/2,false);
	ctx.lineTo(width-r,0);
	//ctx.arcTo(width,0,width,r,r);
	ctx.arc(width-r,r,r,-Math.PI/2,0,false);
	ctx.lineTo(width,height-r);
	//ctx.arcTo(width,height,width-r,height,r);
	ctx.arc(width-r,height-r,r,0,Math.PI/2,false);
	ctx.lineTo(r,height);
	//ctx.arcTo(0,height,0,height-r,r);
	ctx.arc(r,height-r,r,Math.PI/2,Math.PI,false);
	ctx.clip();
	var g = ctx.fillStyle = ctx.createLinearGradient(0,0,0,height);
	g.addColorStop(0, OSUtils.color.long2css(c0));
	g.addColorStop(1, OSUtils.color.long2css(c1));
	ctx.rect(0,0,width,height);
	ctx.fill();
	return canvas;
};

OSGradient.prototype.makeSpan = function(x, y, width, height, color, opacity) {
	var properties = {position: 'absolute',
					  left: x+'px',
					  top: y+'px',
					  width: width+'px',
					  height: height+'px',
					  // for IE:
					  'font-size': 1,
					  'line-height': 0,
					  background: color};
	if (opacity != undefined) properties.opacity = opacity;
	var style = [];
	for (var p in properties)
		style.push(p + ':' + String(properties[p]));
	// IE requires the &nbsp;
	return '<div style="'+style.join(';')+'">&nbsp;</div>';
};

OSGradient.prototype.createGradientElement = function(width, height) {
	var style = this.style;
    var c0 = style['gradient-start-color'];
    var c1 = style['gradient-end-color'];
    var r = style['border-radius'];
	
	function xAt(y) {
		var dy = Math.max(r-y, y-(height-r));
		if (dy >= 0)
			return r - Math.sqrt(r*r-dy*dy);
		return 0;
	};
	
	var bands = 0;
	for (var shift = 24; (shift -= 8) >= 0; )
		bands = Math.max(bands,
						 1+Math.min(Math.abs(c0 - c1) >> shift & 255,
									OSGradient.maxBands[2-shift/8]));
	bands = Math.max(bands, height);
	
	var transitions = [];
	for (var i = 0; i <= bands; i++)
		transitions.push(Math.floor(i * height / bands));
	
	if (r) {
		var tops = [];
		var bottoms = [];
		var lastx = null;
		for (var y = 0; y <= r; y++) {
			var x = Math.ceil(xAt(y));
			if (x == lastx) continue;
			lastx = x;
			transitions.push(y);
			transitions.push(height-y);
		}
		transitions.sort(function(a,b){return a-b});
	}
	OSUtils.Array.removeDuplicates(transitions);
	
    var spans = [];
    for (var i = 0; i < transitions.length-1; i++) {
        var y = transitions[i];
        var h = transitions[i+1] - y;
        var x = Math.ceil(xAt(y));
        var color = OSUtils.color.interpolate(c0, c1, y/height);
		spans.push(this.makeSpan(x, y, width-2*x, h,
								 OSUtils.color.long2css(color)));
    }
	
    var g = document.createElement('div');
    g.innerHTML = spans.join('');
	if (true) {
	g.style.position = 'absolute';
    g.style.left = '0px';
    g.style.top = '0px';
    g.style.width = "100%";
    g.style.height = '100%';
    g.style.zIndex = -1;
	}
	
	return g;
};

OSGradient.prototype.attachGradient = function(parent, gradient) {
	gradient.style.position = 'absolute';
    gradient.style.left = '0px';
    gradient.style.top = '0px';
	// Setting the canvas's dimensions erases its contents in Firefox,
	// even though it's the SAME DIMENSIONS.
	if (gradient.width != parent.offsetWidth)
		gradient.width = parent.offsetWidth;
	if (gradient.height != parent.offsetHeight)
		gradient.height = parent.offsetHeight;
	gradient.style.zIndex = -1;
	
    if (!parent.style.position.match(/absolute|relative/i))
		parent.style.position = 'relative';	
	// The canvas parent has already been set, for Safari.
	if (gradient.parentNode != parent)
		parent.appendChild(gradient);
};

/*
 * Utilities
 */
try {OSUtils} catch(e) {OSUtils = {}}
if (!OSUtils.color) {OSUtils.color = {}}
if (!OSUtils.Array) {OSUtils.Array = {}}

// 0x123456 -> "#123456"
OSUtils.color.long2css = function(n) {
  var a = "0123456789ABCDEF";
  var s = '#';
  for (var i = 24; (i -= 4) >= 0; )
    s += a.charAt((n>>i) & 0xf);
  return s;
};

// (a,b,0)->a; (a,b,1)->b; a and b are rrggbb color numbers.
OSUtils.color.interpolate = function(a, b, s) {
  var n = 0;
  for (var i = 24; (i -= 8) >= 0; ) {
    var ca = (a >> i) & 0xff;
    var cb = (b >> i) & 0xff;
    var cc = Math.floor(ca*(1-s) + cb*s);
    n |= cc << i;
  }
  return n;
};

// Modify +ar+ in-place to remove consecutive duplicates.
OSUtils.Array.removeDuplicates = function(ar) {
	var i = 0, j = 0;
	while (j < ar.length) {
		var v = ar[i] = ar[j++];
		if (!i || ar[i-1] != v) i++;
	}
	ar.length = i;
	return ar;
};

/*
 * Initialization
 */

// If divstyle.js has been included, define these:
try {
	DivStyle.defineProperty('gradient-start-color', 'color');
	DivStyle.defineProperty('gradient-end-color', 'color', 0xffffff);
	DivStyle.defineProperty('border-radius', 'number', 0);
} catch(e) {}

if (window.addEventListener) {
    window.addEventListener('load', OSGradient.applyGradients, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', OSGradient.applyGradients);
} else {
    window.onload = (function() {
        var nextfn = window.onload || function(){};
        return function() {
            OSGradient.applyGradients();
            nextfn();
        }
    })();
}
