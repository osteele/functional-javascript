/*
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  Homepage: http://osteele.com/sources/javascript
  License: MIT License.
  
  Usage:
    var view = HTMLGraphView(document.getElementById('div-id'));
    view.display(graph);
  or:
    view.requestGraph('graphserver.py');
*/

function HTMLGraphView(container) {
    this.canvasController = new TextCanvas(container);
    // requestGraph causes one of these to be invoked
	this.onSuccess = function(graph){this.display(graph)};
	this.onFailure = function(){};
	this.onInvalid = function(){};
}

HTMLGraphView.prototype.display = function(graph, clear) {
 gGraph = graph;
	if (arguments.length < 2) clear = true;
	var controller = this.canvasController;
 debug;
	controller.setDimensions(graph.bb[2], graph.bb[3]);
	var ctx = controller.getContext("2d");
	if (clear)
		ctx.clear();
	new GraphView(graph).render(ctx);
};

HTMLGraphView.prototype.requestGraph = function (url) {
    var self = this;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(){
		self.processRequestChange(request)
	};
	request.open("GET", url, true);
	request.send(null);
};

HTMLGraphView.prototype.processRequestChange = function(request) {
	if (request.readyState != 4)
        return;
    if (0 < request.status && request.status < 200 || 300 < request.status) {
        this.onFailure(request);
        return;
    }
    var result = JSON.parse(request.responseText);
    if (typeof result == 'string') {
        this.onInvalid(result);
        return;
    }
    this.onSuccess(result);
};
