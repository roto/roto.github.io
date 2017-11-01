
function openDeliveryMap() {
	// disable header's Order button
	$('div#delivery #navigator-order').addClass('ui-disabled');

	populateDelivery();

	$.mobile.navigate('#delivery', {
		transition: "fade",
	});
}

function populateDelivery() {
	var $div = $('div#delivery #delivery-list');
	var html = '';
	for (var i in deliveryData) {
		var floor = deliveryData[i];
		var floorHTML = '<fieldset data-role="controlgroup" data-type="horizontal">';
		floorHTML += '<legend>' + floor.name + '</legend>';

		for (var j in floor.seats) {
			var seat = floor.seats[j];
			if (seat.groups && seat.groups.length > 0) {
				for (var k in seat.groups) {
					var groupGUID = seat.groups[k];
					floorHTML += '<input type="button" value="' + seat.displayName + '" name="' + groupGUID + '"';
					floorHTML += ' style="background-color:' + hash_to_rbg(hash_code(groupGUID)) + '"';
					floorHTML += 'onclick="focusGroupTables(\'' + groupGUID + '\')">';
				}
			} else {
				floorHTML += '<input type="button" value="' + seat.displayName + '" disabled>'
			}
		}

		floorHTML += '</fieldset>';

		html = floorHTML + html; // revert the floor order
	}

	$div.html(html).enhanceWithin();
}

function focusGroupTables(groupGUID) {
	var $div = $('div#delivery #delivery-list');

	var $input = $div.find('div.ui-input-btn:has(> input[name="' + groupGUID + '"])');
	if ($input.not('.ui-highlight').length > 0) {
		$div.find('div.ui-input-btn.ui-highlight').removeClass('ui-highlight');
		$input.addClass('ui-highlight');

		// Header's Order button handler
		var $navBtn = $('div#delivery #navigator-order');
		$navBtn.removeClass('ui-disabled');
		$navBtn.off('click').on('click', function() {
			navigateToOrder(groupGUID);
		});
	} else {
		$input.addClass('ui-highlight');
		navigateToOrder(groupGUID);
	}
}

function navigateToOrder(groupGUID) {
	populateOrder(groupGUID);
	$.mobile.navigate('#order', {
		transition: "slidefade",
	});
}
