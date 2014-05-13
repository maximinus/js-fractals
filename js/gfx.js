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
	};

	// class to handle all website and screen interactions
	this.init = function() {
		this.canvas = document.getElementById('canvas');
		this.resizeCanvas();
		window.addEventListener('resize', this.resizeCanvas, false);
	};
	
	this.drawCircles = function() {
		for(var x=0; x<this.width; x++) {
			for(var y=0; y<this.height; y++) {
				// plot a pixel at (x,y)
				var value = x * y & 0xff;
				this.plotPixel(x, y, value);
			}
		}
		this.context.putImageData(this.image, 0, 0);
	};
	
	this.drawMandelbrot = function(x0, x1, y0, y1) {
		// draw from -1 to +1 on the y scale
		var xscale	= (x1 - x0) / this.width;
		var yscale = (y1 - y0) / this.height;
		for(var ypos=0; ypos<this.height; ypos++) {
			for(var xpos=0; xpos<this.width; xpos++) {
				var x = 0.0;
				var y = 0.0;
				var xtemp = 0.0;
				var ytemp = 0.0;
				var iters = 0;
				while(((x * x) + (y * y) < 4.0) && (iters<255)) {
					xtemp = (x * x) - (y * y) + x0;
					y = 2 * x * y + y0;
					x = xtemp;
					iters += 1;
				}
				this.plotPixel(xpos, ypos, iters);
				x0 += xscale;
			}
			x0 = -2.0;
			y0 += yscale;
		}
		console.log('finished');
		this.context.putImageData(this.image, 0, 0);
	};
	
	this.plotPixel = function(x, y, value) {
		var index = (y * this.width + x) * 4;
		this.image_data[index++] = value;
		this.image_data[index++] = value;
		this.image_data[index++] = value;
		this.image_data[index] = 255;
	};
};

