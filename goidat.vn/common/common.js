/*****************************************************************************/
/*                          Common Shared For All Pages                      */
/*****************************************************************************/

/* Find the duplicate order */
function isRequestOrdered(itemID, request, excludeOrderID) {
	for (var i in _Group.orders) {
		if (excludeOrderID === i) {
			continue;
		}

		var order = _Group.orders[i];
		if (order.itemID === itemID) {
			if (!request && !order.request) {
				return true;
			}

			if (request && order.request ) {
				if (request.trim().toLowerCase() === order.request.trim().toLowerCase()) {
					return true;
				}
			}
		}
	}

	return false;
}

function loadRequestInputEvents($div, itemID, orderID) {
	var $requestInput = $div.find('input[name="request"]');
	$requestInput.off("input");
	var $dupWarn = $div.find('#warn-duplicate');

	// there are orders of the same item, monitor the input event
	$requestInput.on("input", function() {
		if (isRequestOrdered(itemID, $requestInput.val(), orderID)) {
			// identical order exists, show warning
			$dupWarn.show();
		} else {
			$dupWarn.hide();
		}
	});

	if (orderID) {
		var order = _Group.orders.hasOwnProperty(orderID) ? _Group.orders[orderID] : _AllOrders[orderID];

		if (order && order.request) {
			$requestInput.val(order.request).trigger("input");
		} else {
			$requestInput.val('').trigger("input");
		}
	} else {
		$requestInput.val('').trigger("input");
	}
}

function loadQuantityInputEvents($div, quantity) {
	var $quantityRangeInput = $div.find('input[name="quantity"]');
	var $slider = $div.find('div[role="application"]');
	updateRangeSlider(quantity ? quantity : 1);

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

function populateOptionInputs($div, itemID) {
	var item = _MenuItems[itemID];

	if (item && item.options) {
		var html = '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">';
		for (var i = 0; i < item.options.length; ++i) {
			var option = item.options[i];
			html += '<label>' + option + '<input type="checkbox"></label>';
		}
		html += '</fieldset>';

		var $optionsDiv = $div.find('[name="options"]');
		$optionsDiv.empty().html(html).parent().enhanceWithin();
	}
}

function loadStateInput($div, state) {
	var $stateChain = $div.find('[name="state-chain"]');
	$stateChain.find('input[value="' + state + '"]').prop('checked', true);
	$stateChain.enhanceWithin();
}

/**
 * return map of only changed properties
 */
function fetchOrderInputs($div) {
	var order = {};

	var quantity = $div.find('input[name="quantity"]').val();
	if (quantity && quantity > 1) {
		order.quantity = quantity;
	}

	var request = $div.find('input[name="request"]').val().trim();
	if (request && request.length > 0) {
		order.request = request;
	}

	var state = $div.find('input[name="state"]:checked').val();
	if (state) {
		order.state = state;
	}
	
	var options = [];
	$div.find('[name="options"] label.ui-checkbox-on').each(function(index, label) {
		options.push($(label).text());
	});

	if (options.length > 0) {
		order.options = options;
	}

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
