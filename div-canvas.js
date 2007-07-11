/*
 * Agenda:
 * - bezierCurveTo, quadraticCurveTo, rect
 * - strokeRect, fillRect
 * - clearRect: assume it covers the rectangle
 * - fill
 * - copyright
 *
 * Hard stuff:
 * - arc, arcTo: figure out how to approximate with cubics?
 * - clearRect: clear the contained pixels, and subdivide the intersecting ones
 * - save, restore, scale, rotate, translate: add matrix
 * - drawImage: complex case
 * - gradients: would be fun, though
 *
 * Won't do:
 * - clip
 * - mitre, join, etc.
 * - alpha
 *
 * jg.drawPolyline(Xpoints,Ypoints);
 * drawRect
 * fillRect
 * drawPolygon(Xpoints, Ypoints
 * fillPolygon
 * drawEllipse(X, Y, width, height)
 * fillEllipse
 *
 * setFont("font-family", "size+unit", Style
 * jg.setFont("arial","15px",Font.ITALIC_BOLD);
 * jg.drawString("Some Text",20,50);
 * drawImage("src", X, Y, width, height)
 * paint()
 * clear
 */

function makeCanvas(element) {
    var jg = new jsGraphics('canvas');
    element.getContext = function (id) {
        return new DIVCanvasContext(element, jg);
    }
}

function DIVCanvasContext(element, jg) {
    this.element = element;
    this.jg = jg;
    this.beginPath();
    this.lineWidth = 1;
    this.strokeStyle = 'black';
}

DIVCanvasContext.prototype.beginPath = function() {
    this.path = new DIVCanvasContext.path();
};

DIVCanvasContext.prototype.closePath = function() {
    this.path.close();
};

DIVCanvasContext.prototype.moveTo = function(x, y) {
    this.path.moveTo.apply(this.path, arguments);
};

DIVCanvasContext.prototype.lineTo = function(x, y) {
    this.path.lineTo.apply(this.path, arguments);
};

DIVCanvasContext.prototype.stroke = function() {
    this.jg.setColor(this.strokeStyle);
    this.jg.setStroke(this.lineWidth);
    for (var i = 0; i < this.path.segments.length; i++) {
        var instr = this.path.segments[i];
        instr.op.apply(this, instr.args);
    }
    this.jg.paint();
};

DIVCanvasContext.path = function () {
    this.segments = [];
};

DIVCanvasContext.path.prototype.close = function() {
    if (this.segments.length) {
        var points = this.segments[0].args;
        this.lineTo(points[0], points[1]);
    }
};

DIVCanvasContext.path.prototype.push = function(op, args) {
    this.segments.push({op:op, args:args});
};

DIVCanvasContext.path.prototype.moveTo = function(x, y) {
    this.push(this.replay.moveTo, arguments);
};

DIVCanvasContext.path.prototype.lineTo = function(x, y) {
    this.push(this.replay.lineTo, arguments);
};

DIVCanvasContext.path.prototype.replay = {
    moveTo: function(x, y) {this.cursor = {x:x,y:y}},
    lineTo: function(x, y) {
        this.jg.drawLine(this.cursor.x, this.cursor.y, x, y);
    }
};
