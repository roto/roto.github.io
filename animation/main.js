$(document).ready(function() {
	$.get('BB_00007.svg')
			.then(injectSvg)
			.always(mergePath)
			.always(correctStrokeWidth)
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

var pathSegmentPattern = /[a-z][^a-z]*/ig;
var pathPointPattern = /([a-z]+)([-+]?[0-9]*\.?[0-9]*),([-+]?[0-9]*\.?[0-9]*)/ig;

function mergePath() {
	var paths = $('.squiggle-animated path');

	var lastPath;

	paths.each(function(index, path) {
		var stroke = path.getAttribute('stroke');
		if (stroke == "none") {
			path.remove();
			return;
		}

		var data = path.getAttribute('d');

		var segments = data.match(pathSegmentPattern);

		if (!lastPath) {
			lastPath = path;
		} else {
			var firstSeg = segments[0];
			pathPointPattern.lastIndex = 0;
			var point = pathPointPattern.exec(firstSeg);

			if (point[1] == "M") {
				var $lastPath = $(lastPath);
				var x = $lastPath.data('x');
				var y = $lastPath.data('y');

				if (Math.abs(x - parseFloat(point[2])) < 0.1 &&
						Math.abs(y - parseFloat(point[3])) < 0.1) {
					// connected path
					path.remove();
					var lastData = lastPath.getAttribute('d');
					for (var i = 1; i < segments.length; ++i) {
						lastData += segments[i];
					}
					lastPath.setAttribute('d', lastData);
				} else {
					// wrap the last path up
					$lastPath.removeData('x');
					$lastPath.removeData('y');
					$lastPath.removeData('count');
					// init the next path chain
					lastPath = path;
				}
			} else {
				throw "First point is not M command";
			}
		}

		updatePathData(lastPath, segments, getStrokeWidth($(path)));
	});
}

function getStrokeWidth($path) {
	var sw = Number($path.css('stroke-width').slice(0, -2));
	return sw;
}

function updatePathData(path, segments, strokeWidth) {
	var x = 0.0;
	var y = 0.0;

	var $path = $(path);

	if (strokeWidth) {
		var count = $path.data('count');
		if (!count) {
			count = 0;
		}

		var lastStrokeWidth = getStrokeWidth($path);
		var newStrokeWidth = (lastStrokeWidth * count + strokeWidth) / (count + 1);
		$path.css('stroke-width', newStrokeWidth + 'px');

		++count;
		$path.data('count', count);
	}


	for (var i = segments.length - 1; i >= 0; --i) {
		var seg = segments[i];
		pathPointPattern.lastIndex = 0;
		var point = pathPointPattern.exec(seg);

		if (!point) {
			var a = 1;
		}

		if (point[1] == "m" || point[1] == "l") {
			x += parseFloat(point[2]);
			y += parseFloat(point[3]);
		} else if (point[1] == "M" || point[1] == "L") {
			$path.data('x', parseFloat(point[2]) + x);
			$path.data('y', parseFloat(point[3]) + y);
			return;
		} else {
			throw "Unrecognized path command: " + point[1];
		}
	}
}

function correctStrokeWidth() {
	var paths = $('.squiggle-animated path');

	var maxSW = 0;
	var minSW = 999999;

	paths.each(function(index, path) {
		var $path = $(path);
		var sw = getStrokeWidth($path);
		if (sw > 0) {
			if (sw > maxSW) {
				maxSW = sw;
			}
			if (sw < minSW) {
				minSW = sw;
			}
		}
	});

	paths.each(function(index, path) {
		var $path = $(path);
		var sw = getStrokeWidth($path);
		if (sw > 0) {
			sw -= minSW;
			sw += 1;
			sw = Math.pow(sw, 2);
			sw -= 1;
			$path.css('stroke-width', sw + 'px');
		}
	});
}

function startAnimation() {
	var paths = $('.squiggle-animated path');

	// sort by class
	//paths = sortByClass(paths);

	paths.each(function(index, path) {
		initPathDrawing(path);
	});
	
	$(paths.get().reverse()).each(function(index, path) {
		startPathDrawing(path);
	});
}

function sortByClass(paths) {
	return paths.sort(function(a, b) {
		var $aClass = $(a).attr('class');
		$aClass = $aClass ? $aClass : '';
		var $bClass = $(b).attr('class');
		$bClass = $bClass ? $bClass : '';
		return $aClass.localeCompare($bClass);
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

	delay += duration;
}

function startPathDrawing(path) {
	// Go!
	path.style.strokeDashoffset = '0';
}
