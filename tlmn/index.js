var emptyColumns = [false, false, false, false];

$(document).ready(function () {
	$('tr[name="players"] input').on('input', function () {
		var $input = $(this);
		var columnIdx = $input.parent().attr('index');
		var value = $input.val().trim();
		$('table').find('tr[name="header"]').get(0).cells[columnIdx].innerHTML = value;
		emptyColumns[columnIdx] = value.length <= 0;
	});

	$('tr[name="new"] input').on('input', onScoreInput);

	function onScoreInput() {
		var $input = $(this);
		var value = $input.val();

		var $row = $input.parent().parent();
		var $cells = $row.children('td');
		calculateLastValue();

		var values = getCellValues($cells);
		if (isZeroSum(values)) {
			$cells.children('input').css('color', 'inherit');
		} else {
			$cells.children('input').css('color', 'red');
		}

		calculateTotals();

		function calculateLastValue() {
			let sum = 0;
			let emptyIdxs = [];
			for (var i = 0; i < $cells.length; ++i) {
				var $cell = $cells.get(i);
				var $input = $cell.children[0];
				if (emptyColumns[i]) {
					$input.value = '';
					$input.disabled = true;
					continue;
				}
				var val = $input.disabled ? undefined : $input.value;
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
				disableInput(emptyIdxs[0], -sum);
			}
		}

		function enableInput(idx) {
			const input = $cells.get(idx).children[0];
			input.value = undefined;
			input.disabled = false;
		}

		function disableInput(idx, value) {
			const input = $cells.get(idx).children[0];
			input.value = value;
			input.disabled = true;
			if ($row.attr('name')) {
				$row.removeAttr('name');
				var newRowHTML = '<tr name="new"><td><input type=number></td><td><input type=number></td><td><input type=number></td><td><input type=number></td></tr>';
				$(newRowHTML).insertAfter($row).find('input').on('input', onScoreInput);
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
});

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
}

function resetScores() {
	$('table tr:not([name])').remove();
	calculateTotals();
}
