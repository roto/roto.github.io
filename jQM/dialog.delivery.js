
function loadDeliveryPopup() {
	$('#delivery-tabs').tabs({ activate: onDeliveryTabActivate });
	$('#dialog-delivery').one('popupbeforeposition', loadDeliveryTable)
			.on('popupafteropen', onDeliveryPopupOpen)
			.on('popupafterclose', onDeliveryPopupClose);

	loadETADatePicker();
}

function loadETADatePicker() {
	var $clockButton = $('#tab-book .ui-input-has-clear > a');
	var $datebox = $('#tab-book .ui-datebox-container');

	$clockButton.on('click', function(event, ui) {
		if ($datebox.is(':visible')) {
			window.setTimeout(function() {
				$datebox.find('a').click();
			}, 0);
		}
	});

	// open the picker on input click
	$('#tab-book .ui-input-has-clear > div').on('click', function(event, ui) {
		if (!$datebox.is(':visible')) {
			event.preventDefault();
			$('#eta-time').datebox('open');
			return false;
		}
	});
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
	if (!onDeliveryPopupClose.etaInterval) {
		window.clearInterval(onDeliveryPopupClose.etaInterval);
		delete onDeliveryPopupClose.etaInterval;
	}

	if ($activeTab == 0) {			// table
		var table = $dialog.find('div#tab-table label.ui-checkbox-on').first().text();
		if (table) {
			dest = 'Table ' + table;
		}
	} else if ($activeTab == 1) {	// book
		// save the current datebox time
		var $datebox = $('#tab-book .ui-datebox-container');
		if ($datebox.is(':visible')) {
			$datebox.find('a').click();
		}

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

	if ($div.children().length === 0) {
		$div.hide();
		var html = '';
		for (var i in deliveryData) {
			var floor = deliveryData[i];
			var floorHTML = '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">';
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

function loadDeliveryBook() {
	var $dialog = $('#dialog-delivery');
	var $main = $dialog.children('[data-role="main"]');
	var $div = $main.children('div#delivery-tabs').children('div#tab-book');
}

function loadDeliveryShip() {
	var $dialog = $('#dialog-delivery');
	var $main = $dialog.children('[data-role="main"]');
	var $div = $main.children('div#delivery-tabs').children('div#tab-ship');
}
