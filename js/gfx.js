"use strict";

// code to handle all drawing to screen and animations
function GFXEngine() {
	this.resizeCanvas = function() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
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

	// class to handle all website and screen interactions
	this.init = function() {
		this.canvas = document.getElementById('canvas');
		this.resizeCanvas();
		window.addEventListener('resize', this.resizeCanvas, false);
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
			console.log("xscale small");
			// xscale is smaller, so has more room. True scale is now y
			scale = ((y1 - y0) / this.height) * -1;
			// resize x
			var extra_size = ((this.width * scale) - (x1 - x0)) / 2.0;
			x0 -= extra_size;
			x1 += extra_size;
		}
		else {
			console.log("yscale small");
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

