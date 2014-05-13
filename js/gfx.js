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
		console.log(this.width, this.height);
		for(var x=0; x<this.width; x++) {
			for(var y=0; y<this.height; y++) {
				// plot a pixel at (x,y)
				var value = x * y & 0xff;
				this.plotPixel(x, y, value);
			}
		}
		this.canvas.putImageData(this.image, 0, 0);
	};
	
	this.plotPixel = function(x, y, value) {
		var index = (y * this.width + x) * 4;
		this.image_data[index++] = value;
		this.image_data[index++] = value;
		this.image_data[index++] = value;
		this.image_data[index] = 255;
	};
};

