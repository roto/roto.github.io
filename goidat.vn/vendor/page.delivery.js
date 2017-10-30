
function populateDelivery() {
	var html = '';
	for (var i in deliveryData) {
		var floor = deliveryData[i];
		var floorHTML = '<fieldset data-role="controlgroup" data-type="horizontal">';
		floorHTML += '<legend>' + floor.name + '</legend>';

		for (var j in floor.seats) {
			var seat = floor.seats[j];
			var seatName = 'seat-' + i + '-' + j;
			if (seat.bills && seat.bills.length > 0) {
				for (var k in seat.bills) {
					floorHTML += '<input type="button" id="' + seatName + '"';
					var billGUID = seat.bills[k];
					floorHTML += ' style="background-color:' + hash_to_rbg(hash_code(billGUID)) + '"';
					floorHTML += 'value="' + seat.displayName + '">'
				}
			} else {
				floorHTML += '<input type="button" id="' + seatName + '"';
				floorHTML += 'value="' + seat.displayName + '">'
			}
		}

		floorHTML += '</fieldset>';

		html = floorHTML + html; // revert the floor order
	}

	$('div#delivery #delivery-list').html(html).enhanceWithin();
}
