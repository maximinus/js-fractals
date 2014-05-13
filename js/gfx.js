"use strict";

// code to handle all drawing to screen and animations
function GFXEngine() {
	this.resizeCanvas = function() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		
		console.log(this.width, this.height);
		
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
		console.log(this.width, this.height);
		for(var x=0; x<this.width; x++) {
			for(var y=0; y<this.height; y++) {
				// plot a pixel at (x,y)
				var value = x * y & 0xff;
				this.plotPixel(x, y, value);
			}
		}
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

