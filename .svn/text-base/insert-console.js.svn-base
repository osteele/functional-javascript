/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  License: MIT License (Open Source)
  Created: 2006-04-01
  Modified: 2006-04-02
  
  Usage:
  Add the following bookmarklet to your browser:
  <a href="javascript:(function(){var s=document.createElement('script');s.type='text/javascript';s.src='http://osteele.com/sources/javascript/insert-console.js';document.documentElement.childNodes[0].appendChild(s)})();">Console</a>
  
  Credits:
  From a suggestion by Stephen Clay <http://mrclay.org/>
*/

function insertInlineConsole() {
	try {InlineConsole.addConsole()}
	catch (e) {
		var timeout = arguments.callee.timeout;
		if (!timeout)
			timeout = arguments.callee.timeout = new Date().getTime() + 10*1000;
		if (timeout > new Date().getTime())
			setTimeout("insertInlineConsole()", 100);
		return;
	}
	window.scroll(0, document.height);
	document.getElementById('eval').focus();
}

(function() {
	function load(url) {
		var s = document.createElement('script');
		s.type = 'text/javascript';
		s.src = url;
		document.documentElement.childNodes[0].appendChild(s);
	};
	var modules = [
		['InlineConsole', 'inline-console.js'],
		['Readable', 'readable.js']];
	for (var i = 0, module; module = modules[i++]; ) {
		try {eval(module[0])}
		catch(e) {load('http://osteele.com/sources/javascript/'+module[1])};
	}
	insertInlineConsole();
})();
