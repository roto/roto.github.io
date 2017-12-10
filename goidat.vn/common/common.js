/*****************************************************************************/
/*                          Common Shared For All Pages                      */
/*****************************************************************************/

/* Find the duplicate order */
function isOrderDuplicate(order) {
	for (var i in _Group.orders) {
		if (order.id === i) {
			continue;
		}

		if (isOrderEqual(order, _Group.orders[i])) {
			return true;
		}
	}

	return false;
}

function isOrderEqual(a, b) {
	if (a.itemID != b.itemID) {
		return false;
	}

	var aRequest = a.request ? a.request.trim().toLowerCase() : a.request;
	var bRequest = b.request ? b.request.trim().toLowerCase() : b.request;

	if (aRequest !== bRequest) {
		return false;
	}

	if (a.options === b.options) {
		return true;
	}

	if ((!a.options && b.options) || (a.options && !b.options)) {
		return false;
	}

	if (a.options.length != b.options.length) {
		return false;
	}

	for (var i = 0; i < a.options.length; ++i) {
		if ($.inArray(a.options[i], b.options) < 0) {
			return false;
		}
	}

	return true;
}

function loadRequestInputEvents($div, order) {
	var $requestInput = $div.find('input[name="request"]');

	// Duplication warning text
	var $dupWarn = $div.find('#warn-duplicate');
	var tempOrder = clone(order);
	
	// there are orders of the same item, monitor the input event
	$requestInput.off("input").on("input", function() {
		fetchRequestInput(tempOrder, $div);
		fetchOptionsInput(tempOrder, $div);

		if (isOrderDuplicate(tempOrder)) {
			// identical order exists, show warning
			$dupWarn.show();
		} else {
			$dupWarn.hide();
		}
	});

	if (order && order.request) {
		$requestInput.val(order.request).trigger("input");
	} else {
		$requestInput.val('').trigger("input");
	}
}

function loadQuantityInputEvents($div, order) {
	var $quantityRangeInput = $div.find('input[name="quantity"]');
	var $slider = $div.find('div[role="application"]');
	updateRangeSlider((order && order.quantity) ? order.quantity : 1);

	$quantityRangeInput.off("focus").on("focus", function() {
		$quantityRangeInput.removeAttr("max");
	});

	$quantityRangeInput.off("blur").on("blur", updateRangeSlider);

	function updateRangeSlider(quantity) {
		if (quantity && !isNaN(quantity)) {
			if (quantity > 10) {
				$quantityRangeInput.removeAttr("max");
			}
			$quantityRangeInput.val(quantity);
		}

		if ($quantityRangeInput.val() > 10) {
			$slider.hide();
		} else {
			$quantityRangeInput.attr("max", 10);
			$quantityRangeInput.slider("refresh");
			$slider.show();
		}
	}
}

function loadOptionInputs($div, order) {
	var item = _MenuItems[order.itemID];
	var options = order.options ? order.options.slice() : [];

	if (item && item.options) {
		var html = '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">';
		for (var i = 0; i < item.options.length; ++i) {
			var option = item.options[i];
			html += '<label>' + option + '<input type="checkbox"';

			var idx = $.inArray(option, options);
			if (idx >= 0) {
				html += ' checked';
				options.splice(idx, 1);
			}

			html += '></label>';
		}

		// TODO: put the rest of options here, or at the begining of the list

		html += '</fieldset>';

		var $optionsDiv = $div.find('[name="options"]');
		$optionsDiv.empty().html(html).parent().enhanceWithin();

		// Duplication warning text
		var $dupWarn = $div.find('#warn-duplicate');
		var tempOrder = clone(order);

		$optionsDiv.find('input').off('change').change(function() {
			// use setTimeout here to queue the action after all the DOM update
			setTimeout(function() {
				fetchRequestInput(tempOrder, $div);
				fetchOptionsInput(tempOrder, $div);
		
				if (isOrderDuplicate(tempOrder)) {
					// identical order exists, show warning
					$dupWarn.show();
				} else {
					$dupWarn.hide();
				}
			});
		});
	}
}

function loadStateInput($div, order) {
	var $stateChain = $div.find('[name="state-chain"]');
	if ($stateChain.length > 0) {
		$stateChain.find('input[value="' + order.state + '"]').prop('checked', true);
		$stateChain.enhanceWithin();
	}
}

/**
 * load the order form inputs
 */
function loadOrderInputs($div, order) {
	loadOptionInputs($div, order);
	loadRequestInputEvents($div, order);
	loadQuantityInputEvents($div, order);
	loadStateInput($div, order);
}

/**
 * return map of only changed properties
 */
function fetchOrderInputs($div) {
	var order = {};

	fetchOptionsInput(order, $div);
	fetchRequestInput(order, $div);
	fetchQuantityInput(order, $div);
	fetchStateInput(order, $div);

	return order;
}

function fetchRequestInput(order, $div) {
	var request = $div.find('input[name="request"]').val().trim();
	order.request = request;
	return order;
}

function fetchQuantityInput(order, $div) {
	var quantity = $div.find('input[name="quantity"]').val();
	order.quantity = quantity;
	return order;
}

function fetchOptionsInput(order, $div) {
	var options = [];
	$div.find('[name="options"] label.ui-checkbox-on').each(function(index, label) {
		options.push($(label).text());
	});
	order.options = options;
	return order;
}

function fetchStateInput(order, $div) {
	order.state = $div.find('input[name="state"]:checked').val();
	return order;
}

function getFilterText(text) {
	var normalizedText = removeDiacritics(text);
	if (normalizedText === text) {
		return text;
	}
	return text + '|' + normalizedText;
}

function switchTheme() {
	var theme = $('#home').attr('data-theme');
	var newTheme = theme === 'b' ? 'a' : 'b';
	var clsToRemove = theme === 'b' ? /\b[\w-]+?-b\b/g : /\b[\w-]+?-a\b/g;

	$('[data-role="page"]').each(function (idx, page) {
		var $page = $(page);
		$page.attr('data-theme', newTheme);

		var cls = $page.attr('class');
		if (cls) {
			cls = cls.replace(clsToRemove, '');
			$page.attr('class', cls);
		}

		/* revert popup overlay style */
		$page.find('[data-role="popup"]').each(function (idx, popup) {
			var $popup = $(popup);
			$popup.attr('data-overlay-theme', theme);

			try {
				$popup.popup('destroy');
			} catch (err) {
				if (err.message.indexOf('prior to initialization') >= 0) {
					// popup might not be initilized, ignore and continue
				} else {
					throw err;
				}
			}
		});

		try {
			$page.page('destroy');
		} catch (err) {
			if (err.message.indexOf('prior to initialization') >= 0) {
				// page might not be initilized, ignore and continue
			} else {
				throw err;
			}
		}

		$page.page();
	});

	local_save('theme', newTheme);
}

function isActiveService(serviceID) {
	if (typeof _ServiceID === 'undefined') {
		return false;
	}

	if ($.mobile.activePage.attr('id') == 'home') {
		return false;
	}

	return _ServiceID == serviceID;
}

function loadServiceData(serviceID) {
	// unscribe the previous channel
	if (VENDEE && _channel) {
		_channel.unsubscribe(_GroupID, messageHandler);
		_channel.unsubscribe(ALL_GROUP, messageHandler);
	}

	var service = _SERVICES[serviceID];
	var customer = _CUSTOMERS[serviceID];

	_ServiceID = serviceID;
	_OrderGroups = customer.groups;
	_DeliveryData = service.delivery;
	_MenuItems = service.product.items;
	_MenuGroups = service.product.categories;
	_GroupID = Object.keys(_OrderGroups)[1];
	_Group = _OrderGroups[_GroupID];
	_AllOrders = customer.queue;

	if (!_AllOrders) {
		loadAllOrders();
	}

	// switch channel and subscribe
	_channel = _ably.channels.get(serviceID);

	if (VENDEE && _channel) {
		_channel.subscribe(_GroupID, messageHandler);
		_channel.subscribe(ALL_GROUP, messageHandler);
	}

	function loadAllOrders() {
		// construct the full order list from bill list
		customer.queue = _AllOrders = {};
		
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
