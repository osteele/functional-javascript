<?php $title='DivStyle'; ?>
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
<tr><td valign="top">Download:</td><td><a
href="http://osteele.com/sources/javascript/divstyle.js">http://osteele.com/sources/javascript/divstyle.js</a>

</td></tr>
<tr><td valign="top">Docs:</td><td><a
href="http://osteele.com/sources/javascript/docs/divstyle">http://osteele.com/sources/javascript/docs/divstyle</a>

</td></tr>
<tr><td valign="top">Example:</td><td><a
href="http://osteele.com/sources/javascript/demos/gradients.html">http://osteele.com/sources/javascript/demos/gradients.html</a>

</td></tr>
<tr><td valign="top">Blog:</td><td><a
href="http://osteele.com/archives/2006/03/javascript-gradient-roundrects">http://osteele.com/archives/2006/03/javascript-gradient-roundrects</a>

</td></tr>
<tr><td valign="top">Created:</td><td>2006-03-16

</td></tr>
<tr><td valign="top">Modified:</td><td>2006-03-21

</td></tr>
</table>
<p>
<tt>divstyle.js</tt> adds a user-extensible style mechanism, that parallels
CSS styles but can contain properties that are not in the CSS standard.
</p>
<p>
When <tt>divstyle.js</tt> is loaded, <tt>&lt;div&gt;</tt> tags in the HTML
document that have a class of &quot;<tt>style</tt>&quot; can contain (a
subset of) CSS, but with nonstandard property names. Each element that is
selected by a &quot;div CSS&quot; rule has a <tt>.divStyle</tt> property.
The value of this property is a map of property names to values.
</p>
<p>
See the <a
href="http://osteele.com/sources/javascript/docs/gradients">Gradient
library</a> for an example of how this can be used.
</p>
<h2>Usage</h2>
<pre>
  &lt;html&gt;
    &lt;head&gt;
      &lt;-- include the divstyle implementation: --&gt;
      &lt;script type=&quot;text/javascript&quot; src=&quot;behaviour.js&quot;&gt;&lt;/script&gt;
      &lt;script type=&quot;text/javascript&quot; src=&quot;divstyle.js&quot;&gt;&lt;/script&gt;
    &lt;/head&gt;
    &lt;body&gt;
      &lt;!-- define the styles: --&gt;
      &lt;div class=&quot;style&quot;&gt;
        #e1, .myclass {my-property: 'string', prop1: 123}
        .myclass {prop2: #ff0000}
      &lt;/div&gt;

      &lt;!-- define the elements.  The styles are applied to these. --&gt;
      &lt;div id=&quot;e1&quot;&gt;&lt;/div&gt;
      &lt;div id=&quot;e2&quot; class=&quot;myclass&quot;&gt;&lt;/div&gt;
      &lt;div id=&quot;e3&quot; class=&quot;myclass&quot;&gt;&lt;/div&gt;

      &lt;!-- access the styles from JavaScript: --&gt;
      &lt;script type=&quot;text/javascript&quot;&gt;
        alert(document.getElementById('e1').divStyle.myProperty);
        alert(document.getElementById('e2').divStyle.prop1);
        alert(document.getElementById('e3').divStyle.prop2);
        var rules = document.divStylesheet.cssRules; // all the rules
      &lt;/script&gt;
     &lt;/body&gt;
   &lt;/html&gt;
</pre>
<h2>Caveats</h2>
<p>
You can&#8217;t put the style content in comments. (Safari strips comments
from the DOM before JavaScript sees them.)
</p>
<p>
CSS simple selectors are limited to at most one modifier (<tt>div.c1</tt>,
but not <tt>div.c1.c2</tt>).
</p>
<p>
Quotes inside an attribute name selector may not work.
</p>
<p>
The CSS parser is incomplete, and doesn&#8217;t recover from many parse
errors.
</p>
<?php include('../../../includes/footer.php'); ?>
