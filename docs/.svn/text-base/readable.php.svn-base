<?php $title='Readable'; ?>
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
href="http://osteele.com/sources/javascript">http://osteele.com/sources/javascript</a>/

</td></tr>
<tr><td valign="top">Docs:</td><td><a
href="http://osteele.com/sources/javascript/docs/readable">http://osteele.com/sources/javascript/docs/readable</a>

</td></tr>
<tr><td valign="top">Download:</td><td><a
href="http://osteele.com/sources/javascript/readable.js">http://osteele.com/sources/javascript/readable.js</a>

</td></tr>
<tr><td valign="top">Created:</td><td>2006-03-03

</td></tr>
<tr><td valign="top">Modified:</td><td>2006-03-20

</td></tr>
</table>
<h1>Description</h1>
<p>
<tt>Readable.js</tt> file adds readable strings for JavaScript values, and
a simple set of logging commands that use them.
</p>
<p>
A readable string is intended for use by developers, to faciliate
command-line and logger-based debugging. Readable strings correspond to the
literal representation of a value, except that:
</p>
<ul>
<li>Collections (arrays and objects) may be optionally be limited in length and
recursion depth.

</li>
<li>Functions are abbreviated. This makes collections that contain them more
readable.

</li>
<li>Some inconsistencies noted in the Notes section below.

</li>
</ul>
<p>
For example, in JavaScript, <tt>[1, &#8217;&#8217;, null ,[3
,&#8217;4&#8217;]].toString()</tt> evaluates to
<tt>&quot;1,,,3,4&quot;</tt>. This is less than helpful for command-line
debugging or logging. With the inclusion of this file, the string
representation of this object is the same as its source representation, and
similarly for <tt>{a: 1, b: 2}</tt> (which otherwise displays as
<tt>[object Object]</tt>).
</p>
<p>
Loading <tt>readable.js</tt> has the following effects:
</p>
<ol>
<li>It defines a <tt>Readable</tt> object. <tt>Readable.toReadable(value)</tt>
is equivalent to <tt>v.toReadable()</tt>, except that it can be applied to
<tt>null</tt> and <tt>undefined</tt>.

</li>
<li>It adds <tt>toReadable</tt> methods to a several of the builtin classes.

</li>
<li>It optionally replaces <tt>Array.prototype.toString</tt> and
<tt>Object.prototype.toString</tt> by &#8230;<tt>.toReadable</tt>. This
makes command-line debugging using Rhino more palatable, at the expense of
polluting instances of <tt>Object</tt> and <tt>Array</tt> with an extra
property that <tt>for(&#8230;in&#8230;)</tt> will iterate over.

</li>
<li>It defines <tt>info</tt>, <tt>error</tt>, <tt>warn</tt>, and <tt>debug</tt>
functions that can be used to display information to the Rhino console, the
browser alert dialog, <a
href="http://www.alistapart.com/articles/jslogging">fvlogger</a>, or a
custom message function.

</li>
</ol>
<p>
Read more or leave a comment <a
href="http://osteele.com/archives/2006/03/readable-javascript-values">here</a>.
</p>
<h2>Readable API</h2>
<h3><tt>Readable.represent(value, [options])</tt></h3>
<p>
Returns a string representation of <tt>value</tt>.
</p>
<h3><tt>object.toReadable([options])</tt></h3>
<p>
Returns a string representation of <tt>object</tt>.
</p>
<h3>options</h3>
<p>
Options is a hash of:
</p>
<ul>
<li><tt>level</tt> &#8212; how many levels of a nested object to print

</li>
<li><tt>length</tt> &#8212; how many items in a collection to print

</li>
<li><tt>stringLength</tt> &#8212; how many characters of a string to print

</li>
<li><tt>omitInstanceFunctions</tt> &#8212; don&#8217;t print Object values of
type <tt>function</tt>

</li>
</ul>
<h2>toString() replacement</h2>
<p>
By default, this file replaces <tt>object.toString()</tt>. and
<tt>array.toString()</tt> with calls to <tt>toReadable()</tt>. To disable
this replacement, define <tt>READABLE_TOSTRING</tt> to a non-false value
before loading this file.
</p>
<p>
In principle, these replacements could break code. For example, code that
depends on
<tt>[&#8216;one&#8217;,&#8217;two&#8217;,&#8217;three&#8217;].toString()</tt>
evaluating to <tt>&quot;one,two,three&quot;</tt> for serialization or
before presenting it to a user will no longer work. In practice, this was
what was most convenient for me &#8212; it means that I can use the Rhino
command line to print values readably, without having to wrap them in an
extra function call. So that&#8217;s the default.
</p>
<h2>Logging</h2>
<p>
This file defines the logging functions <tt>info</tt>, <tt>warn</tt>,
<tt>debug</tt>, and <tt>error</tt>. These are designed to work in the
browser or in Rhino, and to call <tt>fvlogger</tt> if it has been loaded.
(For this to work, <tt>readable.js</tt> has to load <b>after</b>
<tt>fvlogger</tt>.)
</p>
<p>
The functions are defined in one of the following ways:
</p>
<ul>
<li>If <tt>info</tt>, <tt>warn</tt>, <tt>debug</tt>, and <tt>error</tt> have
type <tt>function</tt> when this file is loaded, the new implementations
call the old ones. This is the fvlogger compatability mode, and the new
functions are identical to the fvlogger functions except that (1) they are
variadic (you can call <tt>info(key, &#8217;=&gt;&#8217;, value)</tt>
instead of having to write <tt>info(key + &#8217;=&gt;&#8217; +
value)</tt>), and (2) they apply <tt>toReadable</tt> to the arguments
(which is why the variadicity is important).

</li>
<li>Otherwise, if <tt>alert</tt> has type <tt>function</tt> exists, logging
calls this. This can be useful in the browser. (You can replace a
<tt>ReadableLogger.log</tt> with a function sets the status bar or appends
text to a &lt;div&gt; instead.)

</li>
<li>Otherwise, if <tt>print</tt> has type <tt>function</tt>. This would be the
Wrong Thing in the browser, but the browser will take the <tt>alert</tt>
case. This is for Rhino, which defines <tt>print</tt> this to print to the
console.

</li>
<li>Otherwise logging does nothing. Replace <tt>ReadableLogger.log(level,
msg)/tt&gt; or &lt;tt&gt;ReadableLogger.display(msg)</tt> to change it to
do something.

</li>
</ul>
<p>
The advantages of calling <tt>info</tt> (and the other logging functions)
instead of (in DHTML) <tt>alert</tt> or (in Rhino) <tt>print</tt> are:
</p>
<ul>
<li><tt>info</tt> is variadic

</li>
<li><tt>info</tt> produces readable representations

</li>
<li><tt>info</tt> is compatible between browses and Rhino. This means you can
use Rhino for development of logic and other non-UI code, and test the
code, with logging calls, in both Rhino and the browser.

</li>
</ul>
<h3>Customizing</h3>
<p>
Replace <tt>ReadableLogger.log(level, message)</tt> or
<tt>ReadableLog.display(message)</tt> to customize this behavior.
</p>
<p>
Logging uses ReadableLogger.defaults to limit the maximum length and
recursion level.
</p>
<h2>Notes and Bugs</h2>
<p>
There&#8217;s no check for recursive objects. Setting the <tt>level</tt>
option will at least keep the system from recursing infinitely.
(<tt>level</tt> is set by default.)
</p>
<p>
Unicode characters aren&#8217;t quoted. This is simple laziness. JavaScript
keywords that are used as Object property names aren&#8217;t quoted either.
I haven&#8217;t decided whether this is a bug or a feature.
</p>
<p>
The logging functions intentionally use <tt>toString</tt> instead of
<tt>toReadable</tt> for the arguments themselves. That is, <tt>a</tt> but
not <tt>b</tt> is quoted in <tt>info([a], b)</tt>. This is <b>usually</b>
what you want, for uses such as <tt>info(key, &#8217;=&gt;&#8217;,
value)</tt>. When it&#8217;s not, you can explicitly apply
<tt>toReadable</tt> to the value, e.g. <tt>info(value.toReadable())</tt>
or, when <tt>value</tt> might be <tt>undefined</tt> or <tt>null</tt>,
<tt>info(Readable.toReadable(value))</tt>.
</p>
<h2>Related</h2>
<p>
<a href="http://osteele.com/sources/javascript/">inline-console</a> and <a
href="http://www.alistapart.com/articles/jslogging">fvlogger</a> both
provide user interfaces to log messages to a text area within an HTML page.
<tt>Readable.js</tt> differs from these libraries in that it customizes the
string display of objects to these text areas.
</p>
<p>
<a href="http://osteele.com/sources/openlaszlo/">Simple logging for
OpenLaszlo</a> defines logging functions that are compatible with those
defined by this file. This allows libraries that use these functions to be
used in both OpenLaszlo programs and in DHTML.
</p>
<h4>JSON</h4>
<p>
<a href="http://json.org">JSON</a> stringifies values for computer
consumption. JSON:
</p>
<ul>
<li>Follows a (de facto) <a href="http://json.org">standard</a>.

</li>
<li>Encodes unicode characters in strings.

</li>
<li>Interoperates with other libraries, including those for other languages.

</li>
<li>Guarantees &quot;round tripping&quot;: if an object can be stringified,
reading the string creates an &quot;equal&quot; object, for a fairly
intuitive sense of &quot;equal&quot; (that doesn&#8217;t take into account
structure sharing).

</li>
</ul>
<p>
Readable stringifies values for human consumption. Readable:
</p>
<ul>
<li>Attempts to stringify all values, including regular expressions.

</li>
<li>Stringifies <tt>null</tt>, <tt>undefined</tt>, <tt>NaN</tt>, and
<tt>Infinity</tt>.

</li>
<li>Indicates the presence of <tt>Function</tt> objects in Arrays and Objects.

</li>
<li>Indicates an Object&#8217;s constructor.

</li>
<li>Limits the depth and length of encoded arrays, objects, and strings.

</li>
<li>Omits inherited properties from Objects.

</li>
<li>Defines logging functions.

</li>
<li>Doesn&#8217;t quote property keys (<tt>{a: 1}</tt>, not <tt>{&quot;a&quot;:
1}</tt>).

</li>
<li>(Optionally) replaces {<tt>Object</tt>,
<tt>Array</tt>}<tt>..toString</tt>..

</li>
<li>(Depending on the browser) indicates the types of native objects such as
<tt>document</tt>.

</li>
</ul>
<?php include('../../../includes/footer.php'); ?>
