"use strict";

function Mouse(canvas) {
	this.xpos = 0;
	this.ypos = 0;
	this.old_xpos = 0;
	this.old_ypos = 0;
	this.width = parseInt(canvas.width / 10);
	this.height = parseInt(canvas.height / 10);
	this.view_invalid = true;
	this.canvas_buffer = document.createElement('canvas');
	
	this.draw = function(canvas, context) {
		// draw old image
		this.restoreOldImage(canvas, context);
		context.fillStype = 'black';
		context.fillRect(this.xpos, this.ypos, this.width, this.height);
	};

	this.copyRegionToBuffer = function(canvas) {
		this.canvas_buffer = document.createElement('canvas');
		this.canvas_buffer.width = this.width;
		this.canvas_buffer.height = this.height;
		var ctx = this.canvas_buffer.getContext('2d');
		ctx.drawImage(canvas, this.old_xpos, this.old_ypos, this.width, this.height, 0, 0, this.width, this.height);
	};

	this.restoreOldImage = function(canvas, context) {
		if(this.view_invalid == false) {
			return; }
		context.drawImage(this.canvas_buffer, this.old_xpos, this.old_ypos);		
		this.copyRegionToBuffer(canvas);
		this.view_invalid = false;
	};
	
	this.update = function(x, y) {
		this.old_xpos = this.xpos;
		this.old_ypos = this.ypos;
		this.xpos = x - parseInt(this.width / 2);
		this.ypos = y - parseInt(this.height / 2);
		this.view_invalid = true;
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
		this.canvas.addEventListener('mousemove', this.mouseMove.bind(this), false);
		this.resizeCanvas();
		window.addEventListener('resize', this.resizeCanvas, false);		
		this.mouse = new Mouse(this.canvas);
		// set the clock
		this.interval_id = setInterval(this.mainLoop.bind(this), 20);
	};

	this.mainLoop = function(event) {
		// draw the mouse
		this.mouse.draw(this.canvas, this.context);
	};

	this.mouseMove = function(event) {
		var canvas_pos = this.canvas.getBoundingClientRect();
		this.mouse.update(event.clientX - canvas_pos.left, event.clientY - canvas_pos.top);
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
			var extra_size = ((this.height * scale) - (y1 - y0)) / 2.0;
			y0 -= extra_size;
			y1 += extra_size;
		}
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

