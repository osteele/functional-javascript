<?php $title='Inline Console'; ?>
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
<tr><td valign="top">Docs:</td><td><a
href="http://osteele.com/sources/javascript/docs/inline-console">http://osteele.com/sources/javascript/docs/inline-console</a>

</td></tr>
<tr><td valign="top">Download:</td><td><a
href="http://osteele.com/sources/javascript/inline-console.js">http://osteele.com/sources/javascript/inline-console.js</a>

</td></tr>
<tr><td valign="top">Example:</td><td><a
href="http://osteele.com/sources/javascript/demos/inline-console.html">http://osteele.com/sources/javascript/demos/inline-console.html</a>

</td></tr>
<tr><td valign="top">Created:</td><td>2006-03-03

</td></tr>
<tr><td valign="top">Modified:</td><td>2006-03-20

</td></tr>
</table>
<h2>Usage</h2>
<p>
Include this line in the <tt>head</tt> of an HTML document:
</p>
<pre>
  &lt;script type=&quot;text/javascript&quot; src=&quot;inline-console.js&quot;&gt;&lt;/script&gt;
</pre>
<p>
This will give you a console area at the bottom of your web page. (See <a
href="http://osteele.com/sources/javascript/demos/inline-console.html">http://osteele.com/sources/javascript/demos/inline-console.html</a>
for an example.)
</p>
<p>
The text input field at the top of the console can be used to evaluate
JavaScript expressions and statements. The results are appended to the
console.
</p>
<p>
This file also defines unary functions <tt>info</tt>, <tt>warning</tt>,
<tt>debug</tt>, and <tt>error</tt>, that log their output to the console.
</p>
<h2>Input Area</h2>
<p>
Text that is entered into the input area is evaluated, and the result is
displayed in the console.
</p>
<p>
<tt>properties(object)</tt> displays all the properties of <tt>object</tt>.
(If <tt>readable.js</tt> is loaded, only the first 10 properties will be
displayed. To display all the properties, evaluate
</p>
<pre>
  properties //limit=null
</pre>
<p>
instead. See the Customization section for more about overriding the
<tt>readable.js</tt> defaults.)
</p>
<h2>Customization</h2>
<p>
To customize the location of the console, define
</p>
<pre>
  &lt;div id=&quot;inline-console&quot;&gt;&lt;/div&gt;
</pre>
<p>
in the HTML file.
</p>
<p>
If <tt>readable.js</tt> is loaded, it will limit the length and recursion
level of the displayed string. You can change these limits globally by
assigning to <tt>ReadableLogger.defaults</tt>, e.g.:
</p>
<pre>
  ReadableLogger.defaults.limit=20
  document
</pre>
<p>
You can also change these limits for a single evaluation by appending a
comment string to the end of the value, e.g.:
</p>
<pre>
  document//limit=20
  document//limit=20,level=2
</pre>
<p>
See the <a
href="http://osteele.com/sources/javascript/docs/readable">Readable
documentation</a> for the complete list of options.
</p>
<h2>Related</h2>
<p>
<a href="http://www.alistapart.com/articles/jslogging">fvlogger</a>
provides finer-grained control over the display of log messages. This file
may be used in conjunction with fvlogger simply by including both files. In
this case, the fvlogger logging functions are used instead of the functions
defined here, and if &lt;div id=&quot;inline-console&quot;&gt; is not
defined, it is appended to the end of the the #fvlogger div, rather than to
the end of the HTML body.
</p>
<p>
<a href="http://osteele.com/sources/javascript/">readable.js</a> provides a
representation of JavaScript values (e.g. &quot;<tt>{a: 1}</tt>&quot;
rather than &quot;<tt>[object Object]</tt>&quot;) and variadic logging
functions (e.g. <tt>log(key, &#8217;-&gt;&#8217;, value)</tt> instead of
<tt>log(key + &#8217;-&gt;&#8217; + value)</tt>). This file may be used in
conjunction with <tt>readable.js</tt> by including <tt>readable.js</tt>
<b>after</b> this file.
</p>
<p>
<a href="http://osteele.com/sources/openlaszlo/">Simple logging for
OpenLaszlo</a> defines logging functions that are compatible with those
defined by this file. This allows libraries that use these functions to be
used in both OpenLaszlo programs and in DHTML.
</p>
<?php include('../../../includes/footer.php'); ?>
