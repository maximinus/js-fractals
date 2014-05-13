"use strict";

// code to handle all drawing to screen and animations
function GFXEngine() {
	// class to handle all website and screen interactions
	var canvas = document.getElementById('canvas');
	this.width = canvas.width;
	this.height = canvas.height;
	this.canvas = canvas.getContext('2d');
	this.image = this.canvas.getImageData(0, 0, this.width, this.height);
	this.image_data = this.image.data;
	
	this.drawCircles = function() {
		console.log('working!');
		for(var x=0; x<200; x++) {
			for(var y=0; y<200; y++) {
				// plot a pixel at (x,y)
				var index = (y * this.width + x) * 4;
				var value = x * y & 0xff;
				this.image_data[index++]   = value;    // red
				this.image_data[index++] = value;    // green
				this.image_data[index++] = value;    // blue
				this.image_data[index] = 255;      // alpha
			}
		}
		this.canvas.putImageData(this.image, 0, 0);
		console.log('finished!');
	};
	
	this.plotPixel = function(x, y, r, g, b) {
		var index = (y * this.width + x) * 4;
		this.image_data[0] = r;
		this.image_data[1] = g;
		this.image_data[2] = b;
		this.image_data[3] = 255;
	};
};

