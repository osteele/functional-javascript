<?php $title='TextCanvas'; ?>
<?php include('../../../includes/header.php'); ?>
<h1><?php echo $title; ?></h1>
<table>
<tr><td valign="top">Author:</td><td><a href="http://osteele.com">Oliver Steele</a>

</td></tr>
<tr><td valign="top">Copyright:</td><td>Copyright 2006 Oliver Steele. All rights reserved.

</td></tr>
<tr><td valign="top">License:</td><td>MIT License (Open Source)

</td></tr>
<tr><td valign="top">Homepage:</td><td><a
href="http://osteele.com/sources/javascript">http://osteele.com/sources/javascript</a>

</td></tr>
</table>
<h2>Overview</h2>
<p>
TextCanvas provides an API similar to that of the WHATWG <tt>canvas</tt>
element, but with the addition of a <tt>drawString</tt> method.
<tt>drawString</tt> gives the appearance of rendering a string on the
canvas surface, although it is actually implemented by creating an HTML
element that is absolutely positioned within the canvas&#8217;s container.
</p>
<p>
For example:
</p>
<pre>
  // &lt;div id=&quot;canvasContainer&quot;&gt;&lt;/div&gt;
  var container = document.getElementById('canvasContainer');
  var textCanvasController = new TextCanvas(container);
  var ctx = textCanvasController.getContext('2d');
  ctx.moveTo(0, 0);
  ctx.lineTo(100, 100);
  ctx.stringStyle.color = 'red';
  ctx.drawString(0, 0, &quot;red&quot;);
  ctx.stringStyle.color = 'blue';
  ctx.drawString(100, 100, &quot;blue&quot;);
</pre>
<p>
There is a live example at <a
href="http://osteele.com/sources/javascript/textcanvas-example.html">http://osteele.com/sources/javascript/textcanvas-example.html</a>.
</p>
<p>
This library is only known to work in Firefox. It is known not to work in
Safari. The <a
href="http://osteele.com/sources/openlaszlo/textdrawview-example.swf">OpenLaszlo
version</a> is cross-browser (even Internet Explorer).
</p>
<h2>API</h2>
<h3>TextCanvas</h3>
<h4><tt>var textCanvasController = new TextCanvas(container)</tt></h4>
<p>
Create a virtual &quot;text canvas&quot; within <tt>container</tt> is an
HTML div.
</p>
<h4><tt>textCanvasController.setDimension(width, height)</tt></h4>
<p>
Set the width and height of the canvas.
</p>
<h4><tt>context = textCanvasController.getContext(&#8216;2d&#8217;)</tt></h4>
<p>
Returns a 2D context, modified to accept the following methods:
</p>
<h3>TextCanvas context</h3>
<h4><tt>context.drawString(x, y, string)</tt></h4>
<p>
Draw string at (x, y), with the font and text style properties specified in
context.style (below).
</p>
<h4><tt>context.erase()</tt></h4>
<p>
Erase the content of the canvas. This is equivalent to
<tt>context.clearRect(0, 0, canvas.width, canvas.height)</tt>, except that
it also removes any strings created by context.drawString().
</p>
<h4><tt>context.style</tt></h4>
<p>
An instance of ElementCSSInlineStyle. Calls to drawString use the font and
text properties in this style object. (This API is analogous to the
stateful mechanism that the 2d context provides for setting stroke and fill
properties.)
</p>
<p>
This implementation uses the container&#8217;s style object for this. This
won&#8217;t have any effect if you only set the font and style properties,
but will have surprising results if you set other properties.
</p>
<h2>Known Bugs</h2>
<p>
This has only been tested under Firefox. It is known not to work in Safari.
</p>
<p>
The strings are implemented as HTML divs, which are positioned absolutely
in front of the canvas. They therefore don&#8217;t behave exactly as though
they were on the canvas:
</p>
<ul>
<li><tt>drawString()</tt> doesn&#8217;t respect the current transform.

</li>
<li><tt>drawString()</tt> doesn&#8217;t respect the clip.

</li>
<li>Nontext elements that are drawn subsequent to a string will be positioned
under the string, not under it.

</li>
</ul>
<p>
(This last bug could be fixed by using a delegate overlay generator with a
retargetable proxy. The others would require browser implementation
support.)
</p>
<h2>Also See</h2>
<p>
There is also a version of this library for OpenLaszlo. It can be
downloaded from <a
href="http://osteele.com/sources/openlaszlo/">http://osteele.com/sources/openlaszlo/</a>,
and there is a live example <a
href="http://osteele.com/sources/openlaszlo/textdrawview-example.swf">here</a>.
</p>
<?php include('../../../includes/footer.php'); ?>
