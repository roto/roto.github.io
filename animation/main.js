$(document).ready(function() {
	$.get('sample.svg')
			.then(injectSvg)
			.always(startAnimation);
});

function injectSvg(xmlDoc) {
	var svg = $(xmlDoc).find('svg');
	if (!svg || svg.length == 0) {
		// local file case
		svg = $(xmlDoc);
	}
	$("#container").append(svg);
}

function startAnimation() {
	var paths = $('.squiggle-animated path');

	// sort by class
	paths = paths.sort(function(a, b) {
		var $aClass = $(a).attr('class');
		$aClass = $aClass ? $aClass : '';
		var $bClass = $(b).attr('class');
		$bClass = $bClass ? $bClass : '';
		return $aClass.localeCompare($bClass);
	});

	paths.each(function(index, path) {
		initPathDrawing(path);
	});
}

var speed = 60.0;
var delay = 0.0;

function initPathDrawing(path) {
	// var path = document.querySelector('.squiggle-animated path');
	var length = path.getTotalLength();
	var duration = Math.sqrt(length) / speed;

	// Clear any previous transition
	path.style.transition = path.style.WebkitTransition = 'none';
	// Set up the starting positions
	path.style.strokeDasharray = length + ' ' + length;
	path.style.strokeDashoffset = length;

	// Trigger a layout so styles are calculated & the browser
	// picks up the starting position before animating
	path.getBoundingClientRect();
	// Define our transition
	path.style.transitionProperty = path.style.WebkitTransitionProperty = 'stroke-dashoffset';
	path.style.transitionTimingFunction = path.style.WebkitTransitionTimingFunction = 'ease-in-out';	
	path.style.transitionDuration = path.style.WebkitTransitionDuration = duration + 's';
	path.style.transitionDelay = path.style.WebkitTransitionDelay = delay + 's';
	// Go!
	path.style.strokeDashoffset = '0';

	delay += duration;
}
