
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
	var $tabs = $dialog.find('#delivery-tabs');

	var activeTab = $tabs.tabs("option", "active");

	var data = {};

	if (activeTab == 0) {			// table
		var $tableElement = $dialog.find('div#tab-table label.ui-checkbox-on:not(.seat-taken)').first();
		if (!$tableElement || $tableElement.length <= 0) {
			$tableElement = $dialog.find('div#tab-table label.ui-checkbox-on').first();
		}

		if ($tableElement && $tableElement.text().length > 0) {
			data.tableName = $tableElement.text();
			data.tables = fetchTablesFromDeliveryDialog($dialog);
		}
	} else if (activeTab == 1) {	// book
		data.etaDate = $('#eta-time').datebox('getTheDate').getTime();
	} else if (activeTab == 2) {	// ship
		// TODO: shipping address
		data.address = "Someplace";
	}

	updateDeliveryData(data);
	_channel.publish(ALL_GROUP, {
		script: "updateDeliveryData(message.data.data, message.data.group);",
		data: data,
		group: _GroupID,
	})
}

function updateDeliveryData(data, groupID) {
	if (data.tableName && data.tables) {
		updateGroupOrderDisplayName(data.tableName, groupID);
		updateGroupTables(data.tables, groupID);

		if (VENDOR) {
			populateDelivery();
		}
	} else if (data.etaDate) {
		// TODO: eta time
	} else if (data.address) {
		// TODO: shipping address
	}

	if (!groupID || groupID == _GroupID) {
		updateDeliveryLink(data);
		if (VENDOR) {
			populateOrderHeader();
		}
	}
}

function updateDeliveryLink(data) {
	var $link = $('a#footer-button-delivery');
	var dest;

	// clear the booking delivery personal interval
	if (onDeliveryPopupClose.etaInterval) {
		window.clearInterval(onDeliveryPopupClose.etaInterval);
		delete onDeliveryPopupClose.etaInterval;
	}

	var $tabs = $('#dialog-delivery > [data-role="main"] > div#delivery-tabs');

	if (data.tableName) {
		dest = 'Table ' + data.tableName;

		// clear the table tab
		$tabs.children('div#tab-table').empty();
		$tabs.find('a[href="#tab-table"]').trigger('click');
	} else if (data.etaDate) {
		var eta = new Date(data.etaDate);
		dest = 'ETA: ' + etaTime(eta);
		
		onDeliveryPopupClose.etaInterval = window.setInterval(function() {
			$link.fadeOut();
			$link.text('ETA: ' + etaTime(eta));
			$link.fadeIn('slow');
		}, 1000 * 60);

		$tabs.find('a[href="#tab-book"]').trigger('click');
	} else if (data.address) {
		dest = 'Ship: ';
		$tabs.find('a[href="#tab-ship"]').trigger('click');
		// TODO: shipping address
	}
	
	if ($link.text() !== dest) {
		$link.text(dest);
		$link.fadeOut().fadeIn('slow').fadeOut().fadeIn('slow').fadeOut().fadeIn('slow');
	}
}

function updateGroupOrderDisplayName(tableName, groupID) {
	if (!groupID) {
		groupID = _GroupID;
	}

	_OrderGroups[groupID].tableToDisplay = tableName;

	if (VENDOR) {
		var orders = _OrderGroups[groupID].orders;
		for (var orderID in orders) {
			var order = orders[orderID];

			// update queue list table display
			$('#queue-item-' + order.id + ' span.ui-li-table').text(tableName);
		}
	}
}

function updateGroupTables(tables, groupID) {
	if (!groupID) {
		groupID = _GroupID;
	}

	// update global data
	var group = _OrderGroups[groupID];
	
	// remove all groupID from old seats
	for (var i in group.tables) {
		var table = group.tables[i];
		var seat = _DeliveryData[table.floor].seats[table.seat];

		if (seat.groups && ($.inArray(groupID, seat.groups) >= 0)) {
			// remove the groupGUID from the seat.groups
			seat.groups.splice($.inArray(groupID, seat.groups), 1);
		}
	}

	group.tables = tables;

	// add all groupID to new seats
	for (var i in group.tables) {
		var table = group.tables[i];
		var seat = _DeliveryData[table.floor].seats[table.seat];

		if (!seat.groups) {
			seat.groups = [ groupID ];
		} else if ($.inArray(groupID, seat.groups) < 0) {
			// add the groupGUID to the seat.groups
			seat.groups.push(groupID);
		}
	}
}

function fetchTablesFromDeliveryDialog($dialog) {
	var tables = [];

	$dialog.find('div#tab-table label.ui-checkbox-on').each(function() {
		var $this = $(this);
		var table = $this.attr('for').split('-');
		var floorID = table[1];
		var seatID = table[2];
		tables.push({floor: floorID, seat: seatID});

		var seat = _DeliveryData[floorID].seats[seatID];
		if (!seat.groups) {
			seat.groups = [ _GroupID ];
		} else if ($.inArray(_GroupID, seat.groups) < 0) {
			seat.groups.push(_GroupID);
		}
	});

	return tables;
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
