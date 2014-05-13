"use strict";

// Chess game written in 100% Javascript
// All code released under the GPL3 license
window.onload = main;

function Fractal() {
	// set up the view
	this.init = function() {
		this.gfx = new GFXEngine();
		this.gfx.init();
		this.gfx.drawMandelbrot(-2.0, 1.0, 1.0, -1.0);
	};
};

var fractal = new Fractal();

function main() {
	fractal.init();
};

