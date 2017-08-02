$(document).ready(function(){
	//loadPlayers(players);
	loadScores(scores);

	$('tr[name="players"] input').on('input', function () {
		var $input = $(this);
		var columnIdx = $input.parent().attr('index');
		var value = $input.val();
		if (value.trim().length > 0) {
			var $table = $('table');
			$table.find('tr[name="header"]').get(0).cells[columnIdx].innerHTML = value;
		}	
	});

	$('tr[name="new"] input').on('input', onScoreInput);

	function onScoreInput() {
		var $input = $(this);
		var value = $input.val();

		var $row = $input.parent().parent();
		var $cells = $row.children('td');
		calculateLastValue();
		$cells.children('input').css('color', isZeroSum() ? 'inherit' : 'red');

		function calculateLastValue() {
			var emptyIndex = -1;
			var sum = 0;
			for (var i = 0; i < $cells.length; ++i) {
				var $cell = $cells.get(i);
				var $input = $cell.children[0];
				var val = $input.disabled ? undefined : $input.value;
				if ($.isNumeric(val)) {
					sum += Number(val);
				} else {
					if (emptyIndex >= 0) {
						// has another empty cell, do nothing
						return;
					} else {
						// save the empty cell index
						emptyIndex = i;
					}
				}
			}

			if (emptyIndex >= 0) {
				// there's only 1 empty cell, set the value
				$cells.get(emptyIndex).children[0].value = -sum;
				$cells.get(emptyIndex).children[0].disabled = true;
				if ($row.attr('name')) {
					$row.removeAttr('name');
					var newRowHTML = '<tr name="new"><td><input type=number></td><td><input type=number></td><td><input type=number></td><td><input type=number></td></tr>';
					$(newRowHTML).insertAfter($row);
					$('tr[name="new"] input').on('input', onScoreInput);
				}	
			}
		}

		function isZeroSum() {
			var sum = 0;
			for (var i = 0; i < $cells.length; ++i) {
				var $cell = $cells.get(i);
				var $input = $cell.children[0];
				var val = $input.value;
				if ($.isNumeric(val)) {
					sum += Number(val);
				} else {
					return false;
				}
			}

			return sum == 0;
		}
	}

	$('button[name="reset"]').click(function () {
		if (window.confirm('Are you sure to reset all the scores?')) {
			resetScores();
		}
	});
});

/*function loadPlayers(players) {
	var $table = $('table');
	var $headerRows = $table.find('tr[name="header"]');

	for (var i = 0; i < $headerRows.length; ++i) {
		for (var j = 0; j < players.length; ++j) {
			$headerRows.get(i).cells[j].innerHTML = players[j];
		}
	}
}*/

function resetScores() {
	$('table tr:not([name])').remove()
}

function loadScores(scores) {
	var html = '';
	for (var i = 0; i < scores.length; ++i) {
		var score = scores[i];
		html += '<tr>';
		for (var j = 0; j < score.length; ++j) {
			html += '<td index=' + j +'>' + score[j] + '</td>';
		}
		html += '</tr>'
	}

	resetScores();
	$(html).insertBefore($('table tr[name="new"]'));
}

/*var players = [
	'Phạm', 'Tùng', 'Mèo', 'Mông',
];*/

var scores = [
	[1, 2, 3, 4],
	[5, 6, 7, 8],
];