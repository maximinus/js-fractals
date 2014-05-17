"use strict";

function Rect(x0, x1, y0, y1) {
	this.x0 = x0;
	this.x1 = x1;
	this.y0 = y0;
	this.y1 = y1;
}

function Mouse(canvas) {
	this.xpos = 0;
	this.ypos = 0;
	this.old_xpos = 0;
	this.old_ypos = 0;
	this.width = parseInt(canvas.width / 10);
	this.height = parseInt(canvas.height / 10);
	this.view_invalid = false;
	this.canvas_buffer = document.createElement('canvas');
	this.real_x = 0;
	this.real_y = 0;
	
	this.draw = function(canvas, context) {
		if(this.view_invalid == false) {
			return; }
		// draw old image
		this.restoreOldImage(canvas, context);
		this.copyRegionToBuffer(canvas);
		this.drawRectangle(context);
		this.view_invalid = false;
	};
	
	this.drawRectangle = function(context) {
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		// stroke 1 size smaller than the rectangle
		context.strokeRect(this.xpos + 1, this.ypos + 1, this.width - 2, this.height - 2);
	};

	this.copyRegionToBuffer = function(canvas) {
		this.canvas_buffer = document.createElement('canvas');
		this.canvas_buffer.width = this.width;
		this.canvas_buffer.height = this.height;
		var ctx = this.canvas_buffer.getContext('2d');
		// canvas does not handle negative xpos / ypos, so clip if needed
		// 4 chances: x+y and -, x or y is -, or both positive
		if((this.xpos < 0) && (this.ypos < 0)) {
			ctx.drawImage(canvas, 0, 0, this.width + this.xpos, this.height + this.xpos, -this.xpos,
						  -this.ypos, this.width + this.xpos, this.height + this.ypos); }
		else if(this.xpos < 0) {
			ctx.drawImage(canvas, 0, this.ypos, this.width + this.xpos, this.height, -this.xpos, 0, 
						  this.width + this.xpos, this.height); }
		else if(this.ypos < 0) {
			ctx.drawImage(canvas, this.xpos, 0, this.width, this.height + this.ypos, 0, -this.ypos,
						  this.width, this.height + this.ypos); }
		else {
			ctx.drawImage(canvas, this.xpos, this.ypos, this.width, this.height, 0, 0,
						  this.width, this.height); }
		this.old_xpos = this.xpos;
		this.old_ypos = this.ypos;
	};

	this.restoreOldImage = function(canvas, context) {
		context.drawImage(this.canvas_buffer, this.old_xpos, this.old_ypos);		
	};
	
	this.update = function(x, y) {
		this.real_x = x;
		this.real_y = y;
		this.xpos = (x - parseInt(this.width / 2)) - 2;
		this.ypos = (y - parseInt(this.height / 2)) - 2;
		this.view_invalid = true;
	};
	
	this.reset = function(canvas, context) {
		// we are overlaying a new image. Keep the old x and y
		this.copyRegionToBuffer(canvas);
		this.drawRectangle(context);
		this.view_invalid = false;
	};
}

// code to handle all drawing to screen and animations
function GFXEngine() {
	// class to handle all website and screen interactions
	this.init = function() {
		this.canvas = document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');
		// block right click and remove mouse
		this.canvas.oncontextmenu = function(e) { e.preventDefault(); return(false); }
		//this.canvas.style.cursor = 'none';
		// add mouse events
		this.canvas.addEventListener('mousemove', this.mouseMove.bind(this), false);
		this.canvas.addEventListener('mousedown', this.mouseClick.bind(this), false);
		this.addWheelListener();
		this.resizeCanvas();
		window.addEventListener('resize', this.resizeCanvas, false);	
		this.mouse = new Mouse(this.canvas);
		// set the clock
		this.interval_id = setInterval(this.mainLoop.bind(this), MILLISECONDS_BETWEEN_FRAMES);
		this.rect = new Rect(-2.0, 1.0, 1.0, -1.0);
		this.busy = false;
	};

	this.mainLoop = function(event) {
		// draw the mouse
		this.mouse.draw(this.canvas, this.context);
	};

	this.addWheelListener = function() {
		var wheel_event = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
		if(document.attachEvent) {
			// if IE and maybe Opera
			document.attachEvent('on' + wheel_event, this.mouseWheel.bind(this)); }
		else if(document.addEventListener) {
			// standard WC3
			document.addEventListener(wheel_event, this.mouseWheel.bind(this), false);
		}
	};

	this.mouseMove = function(event) {
		var canvas_pos = this.canvas.getBoundingClientRect();
		this.mouse.update(event.clientX - canvas_pos.left, event.clientY - canvas_pos.top);
	};
	
	this.mouseClick = function(event) {
		if(this.busy == true) {
			return; }
		this.busy = true;
		// so really, we just want to zoom in for now, which is just a redraw
		// where are we in the argand plane?
		var scalex = (this.rect.x1 - this.rect.x0) / this.canvas.width;
		var scaley = (this.rect.y0 - this.rect.y1) / this.canvas.height;
		var delta_y = ((this.canvas.height / 2.0) - this.mouse.real_y) * scaley;
		var delta_x = ((this.canvas.width / 2.0) - this.mouse.real_x) * scalex;
		this.drawMandelbrot(this.rect.x0 - delta_x, this.rect.x1 - delta_x,
							this.rect.y0 + delta_y, this.rect.y1 + delta_y);
		this.mouse.reset(this.canvas, this.context);
		this.busy = false;
	};
	
	this.mouseWheel = function(event) {
		var delta = event.detail? (event.detail * (-120)) : event.wheelDelta;
		console.log(delta);
	};

	this.resizeCanvas = function() {
		this.width = window.innerWidth;
		this.height = window.innerHeight
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		if(this.context) {
			this.context.putImageData(this.image, 0, 0); }
		else {
			this.context = this.canvas.getContext('2d'); }
		this.image = this.context.getImageData(0, 0, this.width, this.height);
		this.image_data = this.image.data;
		this.colour_band = getColourBanding();
	};
	
	this.updateScreen = function() {
		this.context.putImageData(this.image, 0, 0);
	};
	
	this.drawMandelbrot = function(x0, x1, y0, y1) {
		// we might have to stretch things a bit
		var scale = 0.0;
		var xscale = Math.abs((x1 - x0) / this.width);
		var yscale = Math.abs((y1 - y0) / this.height);
		if(xscale < yscale) {
		//if(true) {
			// xscale is smaller, so has more room. True scale is now y
			scale = ((y1 - y0) / this.height) * -1;
			// resize x
			var extra_size = ((this.width * scale) - (x1 - x0)) / 2.0;
			x0 -= extra_size;
			x1 += extra_size;
		}
		else {
			// yscale is smaller, so has more room. True scale is now x
			scale = (x1 - x0) / this.width;
			// resize y
			var extra_size = ((this.height * scale) - (y0 - y1)) / 2.0;
			y0 -= extra_size;
			y1 += extra_size;
		}
		
		// store parameters for later
		this.rect = new Rect(x0, x1, y0, y1);
		
		var xstart = x0;
		for(var ypos=0; ypos<this.height; ypos++) {
			for(var xpos=0; xpos<this.width; xpos++) {
				var x = 0.0;
				var y = 0.0;
				var xtemp = 0.0;
				var ytemp = 0.0;
				var iters = 0;
				while(((x * x) + (y * y) < 4.0) && (iters<156)) {
					xtemp = (x * x) - (y * y) + x0;
					y = 2 * x * y + y0;
					x = xtemp;
					iters += 1;
				}
				this.plotPixel(xpos, ypos, this.colour_band[iters]);
				x0 += scale;
			}
			x0 = xstart;
			y0 -= scale;
		}
		this.updateScreen();
	};
	
	this.plotPixel = function(x, y, value) {	
		var index = (y * this.width + x) * 4;
		this.image_data[index++] = value[0];
		this.image_data[index++] = value[1];
		this.image_data[index++] = value[2];
		this.image_data[index] = 255;
	};
};

function getColourBanding() {
	// return an array of colour values
	var colours = new Array();
	var count = 10;
	var max_count = 250
	var red = max_count;
	var green = 0;
	var blue = 0;
	for(green = 0; green<=max_count; green+=count) {
		colours.push([red, green, blue]); }
	for(red = max_count; red>=0; red-=count) {
		colours.push([red, green, blue]); }
	for(blue = 0; blue<=max_count; blue+=count) {
		colours.push([red, green, blue]); }
	for(green = max_count; green>=0; green-=count) {
		colours.push([red, green, blue]); }
	for(red = 0; red<=max_count; red+=count) {
		colours.push([red, green, blue]); }
	for(blue = max_count; blue>=0; blue-=count) {
		colours.push([red, green, blue]); }
	colours.push([0, 0, 0]);
	return(colours);
};

