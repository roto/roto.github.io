
function populateDelivery() {
	var $div = $('div#delivery #delivery-list');

	if ($div.children().length === 0) {
		$div.hide();
		var html = '';
		for (var i in deliveryData) {
			var floor = deliveryData[i];
			var floorHTML = '<fieldset data-role="controlgroup" data-type="horizontal">';
			floorHTML += '<legend>' + floor.name + '</legend>';

			for (var j = 0; j < floor.seats.length; ++j) {
				var seat = floor.seats[j];
				var seatName = 'seat-' + i + '-' + j;
				floorHTML += '<input type="checkbox" id="' + seatName + '">';
				floorHTML += '<label for="' + seatName + '"';
				if (seat.taken) {
					floorHTML += ' class="seat-taken"';
				}
				floorHTML += '>' + seat.displayName + '</label>'
			}

			floorHTML += '</fieldset>';

			html = floorHTML + html; // revert the floor order
		}

		$div.html(html).enhanceWithin();
		$div.show();
	}		
}
