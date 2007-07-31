<?php 
if (!isset($title)) {
	$standalone = $title = 'JavaScript Libraries';
	include('../../includes/header.php');
?>
<h1><?php echo $title ?></h1>

<div style="float:right"><iframe src="/sources/javascript/bezier-demo.html" width="320" height="300"></iframe><br/>
<iframe src="/sources/javascript/textcanvas-example.html" width="320" height="140"></iframe><br/>
<!--iframe src="/sources/javascript/demos/inline-console.html" width="320" height="140"></iframe><br/-->
</div>
<?php } ?>

<div style="font-size:small">Unless otherwise noted, these have been tested in Firefox 1.5, Safari 2.0, and IE 6.</div>

<h3>Graphics</h3>
<dl>
  <dt><a href="/sources/javascript/docs/gradients">JavaScript Gradient Roundrects</a></dt>
  <dd>Draws gradient roundrects without images.  Gradients can be applied procedurally or, via the <a href="/sources/javascript/docs/divstyle">divstyle library</a>, through CSS.  This uses the WHATWG <code>canvas</code> element if it's available, and a stack of <code>div</code> elements otherwise.  <a href="/sources/javascript/gradients.js">Source</a>, <a href="/sources/javascript/demos/gradients.html">demo</a>, <a href="/sources/javascript/docs/gradients">docs</a>.</dd>
  
  <dt><a href="/sources/javascript/docs/bezier">Bezier Library</a></dt>
  <dd>Measure and subdivide beziers, and animate points along a path composed of single or multiple beziers.  <a href="/sources/javascript/bezier.js">bezier.js</a>, <a href="/sources/javascript/path.js">path.js</a>, <a href="/sources/javascript/bezier-demo.html">demo</a>, <a href="/archives/2006/02/javascript-beziers">blog</a>.  (This library also works in OpenLaszlo.)</dd>
  
  <dt><a href="/sources/javascript/docs/textcanvas">TextCanvas library</a></dt>
  <dd><tt>TextCanvas</tt> is a wrapper for the WHATWG <tt>canvas</tt> element, that adds a <tt>drawString()</tt> method for labeling graphs.  <a href="/sources/javascript/textcanvas.js">Source</a>, <a href="/sources/javascript/docs/textcanvas">docs</a>, <a href="/sources/javascript/textcanvas-example.html">demo</a>, <a href="/archives/2006/02/textcanvas">blog</a>.  This shares the API of the OpenLaszlo <a href="/sources/openlaszlo">textdrawview library</a>.)</dd>
</dl>

<h3>Development</h3>
<dl>
  <dt><a href="/sources/javascript/docs/readable">Readable.js</a></dt>
  <dd><tt>Readable.js</tt> is a JavaScript library for displaying string representations that are useful for debugging.  For example, <code>{a: 1}</code> displays as <tt>{a: 1}</tt> instead of as <tt>[object Object]</tt>; and <code>[1, null, '', [2, 3]]</code> displays as <tt>[1, null, '', [2, 3]]</tt> instead of as <tt>1,,,2,3</tt>.  <a href="/sources/javascript/readable.js">Source</a>, <a href="/sources/javascript/docs/readable">docs</a>, <a href="/archives/2006/03/readable-javascript-values">blog</a>.</dd>
  
  <dt><a href="/sources/javascript/docs/inline-console">Inline Console</a></dt>
  <dd><dfn>Inline Console</dfn> adds a console with an evaluation field to the web page that includes it.  <a href="/sources/javascript/inline-console.js">Source</a>, <a href="/sources/javascript/docs/inline-console">docs</a>, <a href="/sources/javascript/demos/inline-console.html">demo</a>, <a href="/archives/2006/03/inline-console">blog</a>.</dd>
</dl>

<h3>Utilities</h3>
<dl>
  <dt><a href="/sources/javascript/functional">Functional</a></dt>
  <dd><dfn>Functional</dfn> is a library for functional programming in
  JavaScript.  It defines the standard higher-order functions such as
  <code>map</code>, <code>filter</code>, and <code>reduce</code>.  It
  defines functions such as <code>curry</code>, <code>rcurry</code>,
  and <code>partial</code> for partial function application; and
  <code>compose</code>, <code>guard</code>, and <code>until</code> for
  <a
  href="http://en.wikipedia.org/wiki/Function-level_programming">function-level
  programming</a>.  It also defines <dfn>string lambdas</dfn>, which
  allow strings such as <code>'x -> x+1'</code>, <code>'x+1'</code>,
  or <code>'+1'</code> as synonyms for the more verbose
  <code>function(x) {return x+1}</code>.
  <a href="/sources/javascript/functional/functional.js">Source</a>,
  <a href="http://osteele.com/archives/2007/07/functional-javascript">blog</a>.
  <a href="/sources/javascript/functional/">Demo &amp; docs</a>.
  </dd>
  
  <dt><a href="/sources/javascript/docs/divstyle">DivStyle</a></dt>
  <dd><tt>DivStyle</tt> lets you write CSS inside <code>&lt;div&gt;</code> tags.  Why?  So that you can use properties that CSS doesn't define.  The <a href="/sources/javascript/docs/gradients">gradient library</a>, for example, uses this to define <tt>gradient-start-color</tt>, <tt>gradient-end-color</tt>, and <tt>border-radius</tt> properties.  <a href="/sources/javascript/divstyle.js">Source</a>, <a href="/sources/javascript/docs/divstyle">docs</a>.</dd>
</dl>

<?php if($standalone) { ?>
	<p>OpenLaszlo libraries are <a href="/sources/openlaszlo">here</a>. These are written in JavaScript too, but use the OpenLaszlo APIs.</p>
<?php
  include('../../includes/footer.php');
  } ?>