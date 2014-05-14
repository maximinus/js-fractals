"use strict";

// code to handle all drawing to screen and animations
function GFXEngine() {
	this.resizeCanvas = function() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		this.screen = new Coords(width, height);
		this.canvas.width = width;
		this.canvas.height = height;
		if(this.context) {
			this.context.putImageData(this.image, 0, 0); }
		else {
			this.context = this.canvas.getContext('2d'); }
		this.image = this.context.getImageData(0, 0, this.screen.x, this.screen.y);
		this.image_data = this.image.data;
		this.colour_band = getColourBanding();
	};

	// class to handle all website and screen interactions
	this.init = function() {
		this.canvas = document.getElementById('canvas');
		this.resizeCanvas();
		window.addEventListener('resize', this.resizeCanvas, false);
		this.mandelbrot = new Mandelbrot(new Position(-2.0, 1.0, 1.0, -1.0));
	};
	
	this.drawCircles = function() {
		for(var x=0; x<this.screen.x; x++) {
			for(var y=0; y<this.screen.y; y++) {
				// plot a pixel at (x,y)
				var value = x * y & 0xff;
				this.plotPixel(x, y, value);
			}
		}
		this.context.putImageData(this.image, 0, 0);
	};
	
	this.drawMandelbrot = function() {
		this.mandelbrot.draw(this.screen, this.plotPixel.bind(this));
		this.updateScreen();
	};
	
	this.updateScreen = function() {
		this.context.putImageData(this.image, 0, 0);
	};
	
	this.drawMandelbrot2 = function(x0, x1, y0, y1) {
		// we might have to stretch things a bit
		var scale = 0;
		//if(((x1 - x0) / this.width) < ((y1 - y0) / this.height)) {
		if(true) {
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
		for(var ypos=0; ypos<this.screen.x; ypos++) {
			for(var xpos=0; xpos<this.screen.y; xpos++) {
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
		this.context.putImageData(this.image, 0, 0);
	};
	
	this.plotPixel = function(x, y, index) {
	
		console.log(this);
	
		var value = this.colourBand[index];
		var index = (y * this.width + x) * 4;
		this.image_data[index++] = value[0];
		this.image_data[index++] = value[1];
		this.image_data[index++] = value[2];
		this.image_data[index] = 255;
	};
};

function Coords(x, y) {
	this.x = x;
	this.y = y;
};

function Position(a, b) {
	// rectangle is 2 coords, a and b
	this.a = a;
	this.b = b;
};

Position.prototype.width = function() {
	return(this.b.x - this.a.x);
};

Position.prototype.height = function() {
	return(this.b.y - this.a.y);
};

function Mandelbrot(position) {
	this.pos = position;
	
	this.resetPosition = function(screen) {
		if((this.pos.width / screen.x) < (this.pos.height / screen.y)) {
			// xscale is smaller, so has more room. True scale is now y
			this.scale = (this.pos.height() / screen.x) * -1;
			// resize x
			var extra_size = ((screen.w * this.scale) - (this.pos.a.x - this.pos.b.x)) / 2.0;
			this.pos.a.x -= extra_size;
			this.pos.b.x += extra_size;
		}
		else {
			// yscale is smaller, so has more room. True scale is now x
			this.scale = this.pos.width() / screen.x;
			// resize y
			var extra_size = ((screen.y * this.scale) - (this.pos.b.y - this.pos.a.y)) / 2.0;
			this.pos.a.y -= extra_size;
			this.pos.b.y += extra_size;
		}
	};
	
	this.draw = function(screen, pixel_function) {
		this.resetPosition(screen);
		var x0 = this.pos.a.x;
		var y0 = this.pos.b.x;
		var xstart = x0;
		for(var ypos=0; ypos<screen.x; ypos++) {
			for(var xpos=0; xpos<screen.y; xpos++) {
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
				pixel_function(xpos, ypos, iters);
				x0 += scale;
			}
			x0 = xstart;
			y0 -= scale;
		}
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

