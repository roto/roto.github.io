
function loadDeliveryPopup() {
	$('#delivery-tabs').tabs({ activate: onDeliveryTabActivate });
	$('#dialog-delivery').on('popupbeforeposition', loadDeliveryTable)
			.on('popupafteropen', onDeliveryPopupOpen)
			.on('popupafterclose', onDeliveryPopupClose);
}

function onDeliveryPopupOpen(event, ui) {
	// highlight the current tab
	$('#dialog-delivery .ui-tabs-active > a').addClass('ui-btn-active');
}

function onDeliveryPopupClose(event, ui) {
	var $dialog = $(event.target);
	$tabs = $dialog.find('#delivery-tabs');

	var $link = $('a#footer-button-delivery');
	var $activeTab = $tabs.tabs("option", "active");
	var dest;

	// clear the booking delivery personal interval
	if (onDeliveryPopupClose.etaInterval) {
		window.clearInterval(onDeliveryPopupClose.etaInterval);
		delete onDeliveryPopupClose.etaInterval;
	}

	if ($activeTab == 0) {			// table
		var $tableElement = $dialog.find('div#tab-table label.ui-checkbox-on:not(.seat-taken)').first();
		if (!$tableElement || $tableElement.length <= 0) {
			$tableElement = $dialog.find('div#tab-table label.ui-checkbox-on').first();
		}

		if ($tableElement && $tableElement.text().length > 0) {
			dest = 'Table ' + $tableElement.text();
		}
	} else if ($activeTab == 1) {	// book
        var etaDate = $('#eta-time').datebox('getTheDate');
		dest = 'ETA: ' + etaTime(etaDate);

		onDeliveryPopupClose.etaInterval = window.setInterval(function() {
			$link.fadeOut();
			$link.text('ETA: ' + etaTime(etaDate));
			$link.fadeIn('slow');
		}, 1000 * 60);
	} else if ($activeTab == 2) {	// ship
		dest = 'Ship: ';
	}

	if ($link.text() !== dest) {
		$link.text(dest);
		$link.fadeOut().fadeIn('slow').fadeOut().fadeIn('slow').fadeOut().fadeIn('slow');
	}
}

function onDeliveryTabActivate(event, ui) {
	var $activeTab = $(this).tabs("option", "active");

	if ($activeTab == 0) {			// table
		loadDeliveryTable();
	} else if ($activeTab == 1) {	// book
		loadDeliveryBook();
	} else if ($activeTab == 2) {	// ship
		loadDeliveryShip();
	}
}

function loadDeliveryTable() {
	var $dialog = $('#dialog-delivery');
	var $main = $dialog.children('[data-role="main"]');
	var $div = $main.children('div#delivery-tabs').children('div#tab-table');

	if ($div.data('group') !== _GroupID) {
		$div.empty();
	}

	if ($div.children().length === 0 || $div.data('group') !== _GroupID) {
		$div.data('group', _GroupID);

		$div.hide();
		var html = '';
		for (var i in _DeliveryData) {
			var floor = _DeliveryData[i];
			var floorHTML = '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">';
			floorHTML += '<legend>' + floor.name + '</legend>';

			for (var j in floor.seats) {
				var seat = floor.seats[j];
				var seatName = 'seat-' + i + '-' + j;

				var checked = seat.groups && $.inArray(_GroupID, seat.groups) >= 0;
				var taken = seat.groups && seat.groups.length > (checked ? 1 : 0);

				floorHTML += '<input type="checkbox" id="' + seatName + '"' + (checked ? ' checked>' : '>');
				floorHTML += '<label for="' + seatName + '"' + (taken ? ' class="seat-taken">' : '>');
				floorHTML += seat.displayName + '</label>'
			}

			floorHTML += '</fieldset>';

			html = floorHTML + html; // revert the floor order
		}

		$div.html(html).enhanceWithin();
		$div.show();
	}		
}

function loadDeliveryBook() {
	var $dateboxInput = $('#eta-time');

	if ($dateboxInput.attr('data-role') !== 'datebox') {
		// initialize the datebox for the firstime
		var databoxOptions = '{"mode":"timeflipbox",' +
				'"overrideTimeFormat": 24,' +
				'"theme": "b",' +
				'"themeDate": "b",' +
				'"themeClearButton": "b",' +
				'"useInline": true,' +
				'"useKinetic": true,' +
				'"useImmediate": true,' +
				'"useSetButton": false,' +
				'"useClearButton": true,' +
				'"overrideClearButton": "Now"}';

		$dateboxInput.attr('data-role', 'datebox');
		$dateboxInput.attr('data-options', databoxOptions);
		$dateboxInput.datebox();
	}
}

function loadDeliveryShip() {
	var $dialog = $('#dialog-delivery');
	var $main = $dialog.children('[data-role="main"]');
	var $div = $main.children('div#delivery-tabs').children('div#tab-ship');
}
