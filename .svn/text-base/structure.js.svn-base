/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  Homepage: http://osteele.com/sources/javascript
  License: MIT License.
  
  == Overview
  Structure.js is a JavaScript library that adds structure to
  an HTML page.  It is intended as a complement to the behavior.js,
  which adds behavior but does not modify the pre-existing structure.
  
  Structure.js is intended to work around the common problem that
  the visual styling of a web page requires nonsemantic elements
  (nested divs, tables and cells) that are bothersome to maintain
  in the source.
  
  Alternatives to structure.js are server-side page generation
  technologies, such as PHP, JSP, XSLT, and the myriad HTML templating
  languages, to the extent that these languages allow you to define
  source tags that generate multiple output tags.  (This is trivial,
  for example, with RHTML, and very cumbersome with PHP.)
  
  The advantage of structure.js is that it allows you maintain a web
  page as a single HTML source.  A potential, but unrealized,
  advantage is that template expansion can be parameterized on the
  runtime context (e.g. screen size, device type, preferred output
  modality, user settings).  The disadvantage is that it adds
  complexity to the runtime environment, and initialization time to
  the page view.
  
  == Usage
  Include structure.js in the head section of an HTML page:
    <html>
      <head>
        <script src="structure.js"></script>
  
  Create a "definitions" section within the body of the HTML page, and
  place templates therein.  A template is a "document fragment with
  holes".  It is an element that is directly contained by the
  "definitions" section.  The name of the template is the id of the
  element.  The "holes" are defined by attaching class definitions to
  elements within these templates.  When the template is applied to an
  element, the parts of that element fill in the holes.
    <body>
      <div id="definitions">
        <div id="myclass">
          <h2>Headline {Math.random()}</h2>
          <div class="content">Content gets substituted here.</div>
        </div>
      </div>
  
  Declare an instance *outside* the "definitions" section.  A template
  that is defined inside the definition section is applied to any
  element outside the definitions section whose class name is the same
  as a template name.
      <div class="myclass">
        <p>Some content.</p>
        <p>More content.</p>
      </div>
  
  == Examples
    <div id="myclass" style="border:1px solid red">
      <div style="border:1px solid blue">
        <div class="content"></div>
      </div>
    </div>
  +
    <div class="myclass" style="background:green">
      <p>Some text</p>
    </div>
  =
    <div style="border:1px solid red;background: green">
      <div style="border:1px solid blue">
        <p>Some text</p>
      </div>
    </div>
  
    <div id="section">
      <h2></h2>
      <p class="content"></p>
    </div>
  +
    <div class="section">
      <div class="content">My Title</div>
      My content.
    </div>
  =
    <div class="section">
      <h2>My Title</h2>
      <p>My content</p>
    </div>
  
    <table id="section">
      <tr><td class="content"></td></tr>
      <tr><th class="title"></th></tr>
    </div>
  +
    <div class="section">
      <div class="content">My Title</div>
      My content.
    </div>
  =
    <div class="section">
      <h2>My Title</h2>
      <p>My content</p>
    </div>
  == Spec
  
  For each element C whose parent is $('definitions') and whose ID is 'c',
  each element E whose class is 'c' is replaced by a copy of C such that:
  - If C contains an element whose class is 'content', this element
    is replaced by the content of E.
  - The content of any descendant of C whose class is 'where', is
    replaced replaced 
  
  Agenda:
  - define semantics for multiple replacements
  - implement multiple replacements
  - replace by contents of div, not by div itself?
  - Safari (remove Element)
  
  Features:
  - recursive definitions
  
  Codeliness:
  - template objects
  - API to apply template to object

  Corners:
  - IE
  
  Finally:
  - test docs
  
  Future:
  - separate definition file
  - table layout
  - nested definitions
*/

var OSStructure = {};

OSStructure.getClassDefinitions = function () {
	if (this._definitions) return this._definitions;
	var parent = document.getElementById('definitions');
	var definitions = {};
	if (!parent) return this._definitions = definitions;
	for (var node = parent.firstChild; node; node = node.nextSibling )
		if (node.id)
			definitions[node.id] = node;
	return this._definitions = definitions;
};

OSStructure.findClassDefinition = function (elt) {
	if (!elt.className) return;
	var classNames = elt.className.split(/\s+/)
	var definitions = this.getClassDefinitions();
	for (var i = 0, className; className = classNames[i++]; )
		if (definitions[className]) return definitions[className];
};

OSStructure.inDefinitionSection = function (elt) {
	for (; elt; elt = elt.parentNode)
		if (elt.id == 'definitions')
			return true;
	return false;
};

OSStructure.getInstances = function () {
	var instances = [];
	var elements = document.getElementsByTagName('*');
	for (var i = 0, e; e = elements[i++]; )
		if (!this.inDefinitionSection(e) && this.findClassDefinition(e))
			instances.push(e);
	return instances;
};

OSStructure.removeIds = function(node) {
    if (!arguments.callee.seed) arguments.callee.seed = 0;
    if (node.id) node.id += '-' + (arguments.callee.seed += 1);
    for (var i = 0, child; child = node.childNodes[i++]; )
        if (child instanceof Element)
            OSStructure.removeIds(child);
};

OSStructure.applyClassDefinition = function (definition, instance) {
	var copy = definition.cloneNode(true);
    OSStructure.removeIds(copy);
	instance.parentNode.insertBefore(copy, instance);
	instance.parentNode.removeChild(instance);
	this.replace(copy, 'content', instance);
};

OSStructure.replace = function(node, className, instance) {
	if (node.className && node.className.match(new RegExp('\\b' + className + '\\b'))) {
		node.parentNode.insertBefore(instance, node);
		node.parentNode.removeChild(node);
		return true;
	}
	for (var child = node.firstChild; child; child = child.nextSibling)
		if (this.replace(child, className, instance))
			return true;
	return false;
};

OSStructure.expandClassDefinitions = function () {
	if (this != OSStructure) return arguments.callee.apply(OSStructure, arguments);
	var instances = this.getInstances();
	for (var i = 0, instance; instance = instances[i++]; ) {
		var definition = this.findClassDefinition(instance);
		this.applyClassDefinition(definition, instance);
	}
};

if (window.addEventListener) {
    window.addEventListener('load', OSStructure.expandClassDefinitions, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', OSStructure.expandClassDefinitions);
} else {
    window.onload = (function() {
        var nextfn = window.onload || function(){};
        return function() {
            OSStructure.expandClassDefinitions();
            nextfn();
        }
    })();
}
