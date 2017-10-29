
function populateDelivery() {
	var $div = $('div#delivery #delivery-list');

	if ($div.children().length === 0) {
		$div.hide();
		var html = '';
		for (var i in deliveryData) {
			var floor = deliveryData[i];
			var floorHTML = '<fieldset data-role="controlgroup" data-type="horizontal">';
			floorHTML += '<legend>' + floor.name + '</legend>';

			for (var j in floor.seats) {
				var seat = floor.seats[j];
				var seatName = 'seat-' + i + '-' + j;
				floorHTML += '<input type="checkbox" id="' + seatName + '">';
				floorHTML += '<label for="' + seatName + '"';
				if (seat.bills && seat.bills.length > 0) {
					for (var k in seat.bills) {
						// TODO: solve multiple bills
						var billGUID = seat.bills[k];
						// TODO: better random generated color
						floorHTML += ' style="background-color:' + hash_to_rbg(hash_code(billGUID)) + '"';
					}
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
