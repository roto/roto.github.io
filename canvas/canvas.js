$(document).ready(function(){
	// Set up the canvas
	var canvas = document.getElementById("main-canvas");
	var ctx = canvas.getContext("2d");
	// Fill the canvas to the screen without scalling the mouse/touch coordinate
	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
	ctx.lineCap="round";
	ctx.lineWidth = 6;

	// Set up mouse events for drawing
	var drawing = false;
	var mousePos = { x:0, y:0 };
	var lastPos = mousePos;

	$.Finger = {
		pressDuration: 300,
		doubleTapInterval: 300,
		flickDuration: 150,
		motionThreshold: 5
	};

	$(canvas).on("tap", function(e) {
		ctx.beginPath();
		ctx.arc(e.x, e.y, 30, 0, 2 * Math.PI);
		ctx.stroke();
	});

	$(canvas).on("doubletap", function(e) {
		ctx.beginPath();
		ctx.arc(e.x, e.y, 30, 0, 2 * Math.PI);
		ctx.beginPath();
		ctx.arc(e.x, e.y, 60, 0, 2 * Math.PI);
		ctx.stroke();
	});

	$(canvas).on("press", function(e) {
		ctx.beginPath();
		ctx.arc(e.x, e.y, 30, 0, 2 * Math.PI);
		ctx.fill();
	});

	$(canvas).on("drag", function(e) {
		ctx.strokeStyle = "grey";
		ctx.beginPath();
		ctx.moveTo(e.x - e.dx, e.y - e.dy);
		ctx.lineTo(e.x, e.y);
		ctx.stroke();
	});

	$(canvas).on("flick", function(e) {
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(e.x - e.dx, e.y - e.dy);
		ctx.lineTo(e.x, e.y);
		ctx.stroke();
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