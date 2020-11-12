var emptyColumns = [false, false, false, false];

$(document).ready(function () {
	$('tr[name="players"] input').on('input', function () {
		var $input = $(this);
		var columnIdx = $input.parent().attr('index');
		var value = $input.val().trim();
		$('table').find('tr[name="header"]').get(0).cells[columnIdx].innerHTML = value;
		emptyColumns[columnIdx] = value.length <= 0;
		localStorage.setItem('name-' + columnIdx, value);
	});

	$('tr[name="new"] input')
		.on('input', onScoreInput)
		.on('keydown', onScoreEnter)

	function onScoreEnter(e) {
		if (e.key !== 'Enter') {
			return
		}
		nextOnTabIndex(e.target).focus()
	}

	function onScoreInput(e) {
		var $active = $(this);

		var $row = $active.parent().parent();
		var $cells = $row.children('td');
		calculateLastValue($cells, $active);

		var values = getCellValues($cells);
		if (isZeroSum(values)) {
			$cells.children('input').css('color', 'lightgray');
		} else {
			$cells.children('input').css('color', '#FF9800');
		}

		calculateTotals();

		function calculateLastValue($cells, $active) {
			let sum = 0;
			let emptyIdxs = [];
			for (var i = 0; i < $cells.length; ++i) {
				var $cell = $cells.get(i);
				var input = $cell.children[0];
				if (emptyColumns[i]) {
					input.value = undefined;
					// $input.disabled = true;
					continue;
				}
				var val = input.disabled ? undefined : input.value;
				if ($.isNumeric(val)) {
					sum += Number(val);
				} else {
					emptyIdxs.push(i)
				}
			}

			if (emptyIdxs.length > 1) {
				// clear all input of remain status
				emptyIdxs.forEach(idx => enableInput(idx))
			} else if (emptyIdxs.length === 1) {
				const isCurrent = $active[0].getAttribute('index') == emptyIdxs[0]
				const emptyingCurrentInput = !e.data && !e.originalEvent.data
				if (!isCurrent || emptyingCurrentInput) {
					disableInput(emptyIdxs[0], -sum);
				}
			}
		}

		function enableInput(idx) {
			// const input = $cells.get(idx).children[0];
			// input.disabled = false;
		}

		function disableInput(idx, value) {
			const input = $cells.get(idx).children[0];
			input.value = value;
			// input.disabled = true;
			if ($row.attr('name')) {
				$row.removeAttr('name');
				var newRowHTML = '<tr name="new"><td><input index=0 type=number></td><td><input index=1 type=number></td><td><input index=2 type=number></td><td><input index=3 type=number></td></tr>';
				$(newRowHTML).insertAfter($row).find('input')
					.on('input', onScoreInput)
					.on('keydown', onScoreEnter)
			}	
		}
	}

	$('button[name="reset"]').click(function () {
		if ($('table tr:not([name])').length > 0) {
			if (window.confirm('Are you sure to reset all the scores?')) {
				resetScores();
			}
		}
	});

	try {
		loadData()
	} catch (err) {
		console.error('Failed to load local scores', err)
	}
});

function loadData() {
	const event = new Event('input', { bubbles: true, cancelable: true });

	// load the players name
	for (let i = 0; i < 4; ++i) {
		const name = localStorage.getItem('name-' + i)
		if (!name) {
			continue
		}
		const element = $('table').find(`tr[name="players"] > th[index="${i}"] > input`).get(0)
		element.value = name
		element.dispatchEvent(event);
	}

	// load the total scores
	const item = localStorage.getItem('totals');
	if (!item) {
		return
	}
	const totals = JSON.parse(item);
	if (!totals || !totals.some(t => t !== 0)) {
		return
	}
	const inputs = $('tr[name="new"] input')
	for (let i = 0; i < totals.length; ++i) {
		inputs[i].value = totals[i]
		inputs[i].dispatchEvent(event);
	}
}

function saveScores(totals) {
	localStorage.setItem('totals', JSON.stringify(totals));
}

function isZeroSum(values) {
	var sum = 0;
	for (var i = 0; i < values.length; ++i) {
		if (emptyColumns[i]) {
			continue;
		}
		var val = values[i];
		if (val === NaN) {
			return false;
		} else {
			sum += val;
		}
	}
	return sum == 0;
}

function getCellValues($cells) {
	var values = [];
	for (var i = 0; i < $cells.length; ++i) {
		if (emptyColumns[i]) {
			continue;
		}
		var val = $cells.get(i).children[0].value;
		values[i] = $.isNumeric(val) ? Number(val) : NaN;
	}
	return values;
}

function calculateTotals() {
	var totals = [ 0, 0, 0, 0 ];
	var $rows = $('table tr:not([name])');

	for (var r = 0; r < $rows.length; ++r) {
		$row = $($rows.get(r));
		var $cells = $row.children('td');
		var values = getCellValues($cells);
		if (isZeroSum(values)) {
			for (var i = 0; i < totals.length; ++i) {
				if (emptyColumns[i]) {
					continue;
				}
				totals[i] += values[i];
			}
		}
	}

	var $totalEs = $('table tr[name="total"] th');
	for (var i = 0; i < $totalEs.length; ++i) {
		$totalEs.get(i).innerHTML = emptyColumns[i] ? '' : totals[i];
	}

	saveScores(totals)
}

function resetScores() {
	$('table tr:not([name])').remove();
	calculateTotals();
}

function nextOnTabIndex(element) {
	const fields = $($('table')
		.find('a[href], button, input, select, textarea')
		.filter(':visible').filter('a, :enabled')
		.toArray()
		.sort(function (a, b) {
			return ((a.tabIndex > 0) ? a.tabIndex : 1000) - ((b.tabIndex > 0) ? b.tabIndex : 1000);
		}));

	return fields.eq((fields.index(element) + 1) % fields.length);
}

// Production steps of ECMA-262, Edition 5, 15.4.4.17
// Reference: http://es5.github.io/#x15.4.4.17
if (!Array.prototype.some) {
	Array.prototype.some = function (fun, thisArg) {
		'use strict';

		if (this == null) {
			throw new TypeError('Array.prototype.some called on null or undefined');
		}

		if (typeof fun !== 'function') {
			throw new TypeError();
		}

		var t = Object(this);
		var len = t.length >>> 0;

		for (var i = 0; i < len; i++) {
			if (i in t && fun.call(thisArg, t[i], i, t)) {
				return true;
			}
		}

		return false;
	};
}
