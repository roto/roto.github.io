$(document).ready(function(){
	// Set up the canvas
	var canvas = document.getElementById("main-canvas");
	var ctx = canvas.getContext("2d");
	// Fill the canvas to the screen without scalling the mouse/touch coordinate
	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
	ctx.strokeStyle = "grey";
	ctx.lineWidth = 6;

	// Set up mouse events for drawing
	var drawing = false;
	var mousePos = { x:0, y:0 };
	var lastPos = mousePos;

	$(canvas).on("tap", function() {
		document.body.innerHTML = "tab";
	});

	$(canvas).on("doubletap", function() {
		document.body.innerHTML = "doubletap";
	});

	$(canvas).on("press", function() {
		document.body.innerHTML = "press";
	});

	$(canvas).on("flick", function() {
		document.body.innerHTML = "flick";
	});

	$(canvas).on("drag", function() {
		document.body.innerHTML = "drag";
	});

	/*var timer;
	$(canvas).on("mousedown",function(){
		timer = setTimeout(function(){
			alert("WORKY");
		}, 500);
	}).on("mouseup mouseleave",function(){
		clearTimeout(timer);
	});*/

	// Get the position of the mouse relative to the canvas
	function getMousePos(canvasDom, mouseEvent) {
		var rect = canvasDom.getBoundingClientRect();
		return {
			x: mouseEvent.clientX - rect.left,
			y: mouseEvent.clientY - rect.top
		};
	}

	// Prevent page scrolling on mobile
	document.body.addEventListener('touchmove', function(event) {
		event.preventDefault();
	}, false);

	// Get a regular interval for drawing to the screen
	window.requestAnimFrame = (function (callback) {
		return window.requestAnimationFrame || 
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimaitonFrame ||
				function (callback) {
					window.setTimeout(callback, 1000/60);
				};
	})();

	// Draw to the canvas
	function renderCanvas() {
		if (drawing) {
			ctx.moveTo(lastPos.x, lastPos.y);
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.stroke();
			lastPos = mousePos;
		}
	}

	// Allow for animation
	/*(function drawLoop () {
		window.requestAnimFrame(drawLoop);
		renderCanvas();
	})();*/
})