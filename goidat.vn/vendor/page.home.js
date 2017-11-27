function populateHome() {
	var html = '';
	
	// for all orders
	for (var serviceID in _SERVICES) {
		html += generateServiceItemHTML(serviceID);
	}

	$('ul#service-list[data-role="listview"]').empty().append($(html)).listview().listview("refresh")
			.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
				initial($(this));
			});
}

function generateServiceItemHTML(serviceID) {
	var service = _SERVICES[serviceID];
	var html = '<li id="service-item-' + serviceID + '"><a href="javascript:navigateToService(\'' + serviceID + '\');">';

	if (service.initial) {
		html += '<img data-name="' + service.initial + '" class="initial uninitialized" style="border-radius: 15%">';
	}

	if (service.alias) {
		html += '<h2>' + service.alias + '</h2>';
	}

	if (service.desc) {
		html += '<p>' + service.desc + '</p>';
	}

	if (service.status) {
		html += '<span class="ui-li-count">' + service.status + '</span>';
	}

	return html;
}

function navigateToService(serviceID) {
	$.mobile.navigate('#queue', {
		transition: "slidefade",
	});

	loadServiceData(serviceID);
	populateService();
}

function loadServiceData(serviceID) {
	var service = _SERVICES[serviceID];
	var customer = _CUSTOMERS[serviceID];

	_OrderGroups = customer.groups;
	_DeliveryData = service.delivery;
	_MenuItems = service.product.items;
	_MenuGroups = service.product.categories;
	_GroupID = Object.keys(_OrderGroups)[1];
	_Group = _OrderGroups[_GroupID];
	_AllOrders = customer.queue;

	if (!_AllOrders) {
		// construct the full order list from bill list
		customer.queue = _AllOrders = {};

		if (_AllOrders) {
			var sorted = [];
			for (var groupID in _OrderGroups) {
				var tableSharedCount = Number.MAX_SAFE_INTEGER;

				var group = _OrderGroups[groupID];
				group.tableToDisplay = getGroupDisplayName(group);
				
				for (var orderID in group.orders) {
					var order = group.orders[orderID];
					order.id = orderID;
					order.groupID = groupID;
					order.state = OrderState.QUEUEING;

					sorted.push(order);
				}
			}

			sorted.sort(compareOrder);

			for (var i = 0; i < sorted.length; ++i) {
				var order = sorted[i];
				_AllOrders[order.id] = order;
			}
		}

		function getGroupDisplayName(group) {
			var displayName;

			for (var i in group.tables) {
				var table = group.tables[i];
				var floorID = table.floor;
				var seatID = table.seat;

				var floor = _DeliveryData[floorID];
				if (!floor) {
					throw 'Floor not exist: ' + floorID;
				}

				var seat = floor.seats[seatID];
				if (!seat) {
					throw 'Seat not exist: ' + seatID + ' on floor ' + floorID;
				}

				if (!seat.groups) {
					seat.groups = [ groupID ];
				} else if ($.inArray(groupID, seat.groups) < 0) {
					seat.groups.push(groupID);
				}

				if (tableSharedCount > seat.groups.length) {
					tableSharedCount = seat.groups.length;
					displayName = seat.displayName;
				}
			}

			return displayName;
		}
	}
}
