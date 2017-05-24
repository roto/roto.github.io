$(document).ready(function(){
	function a() {
	}

	var paper = Raphael("wrap");
	var svg = document.querySelector("svg");

	paper.resetViewBox = function() {
		var height = 1000 * window.innerHeight / window.innerWidth;
		paper.forEach(function(el) {
			var box = el.getBBox();
			height = Math.max(height, box.y2 + 1);
		});
		paper.setViewBox(0, 0, 1000, height, true);

		// ok, raphael sets width/height even though a viewBox has been set,
		// so let's rip out those attributes (yes, this will not work for VML)
		svg.removeAttribute("width");
		svg.removeAttribute("height");
	}

	var circle = paper.circle(100, 100, 80);

	for(var i = 0; i < 5; i+=1) {
		var multiplier = i*5;
		paper.circle(250 + (2*multiplier), 1000 + multiplier, 50 - multiplier);
	}

	paper.resetViewBox();
	$(window).on('resize', paper.resetViewBox);
})