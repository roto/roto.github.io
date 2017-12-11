
function populateOrder(groupID) {
	if (groupID) {
		_GroupID = groupID;
		_Group = _OrderGroups[groupID];

		populateOrderHeader();
	}

	var ordersHTML = generateOrdersHTML();

	var $ul = $('ul#order-list[data-role="listview"]');
	$ul.empty().append($(ordersHTML)).listview().listview("refresh");

	if (VENDOR) {
		$ul.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
			initial($(this));
		});
	}

	loadDeliveryPopup();

	if (_Group.tableToDisplay) {
		var dest = 'Table ' + _Group.tableToDisplay;
		$('a#footer-button-delivery').text(dest);
	}
}

function populateOrderHeader() {
	var $div = $('#order > div[data-role="subheader"]');
	var html = '<div data-role="delivery-table" align="center"><fieldset data-role="controlgroup" data-type="horizontal">';

	var group = _OrderGroups[_GroupID];
	for (var i in group.tables) {
		var table = group.tables[i];
		var seat = _DeliveryData[table.floor].seats[table.seat];

		html += '<input type="button" value="' + seat.displayName + '"';
		html += ' style="background-color:' + hash_to_rbg(hash_code(_GroupID)) + '">';
	}

	html += '</fieldset></div>';

	$div.html(html).enhanceWithin();
}

function generateOrdersHTML() {
	var ordersHTML = '';

	// for each menu's groups
	for (var id in _Group.orders) {
		var order = _Group.orders[id];
		ordersHTML += generateOrderHTML(order);
	}

	// add an big plus sign to add new order
	ordersHTML += '<li id="new-order"><a href="#menu" data-transition="slidefade"><div class="ui-li-thumb"><img src="http://library.austintexas.gov/sites/default/files/plus-gray.svg"></div></a></li>';

	return ordersHTML;
}

function generateOrderHTML(order) {
	var orderHTML = '<li id="order-item-' + order.id + '"><a href="javascript:openOrderDialog(\'status\', \'' + order.id + '\')">';

	var item = _MenuItems[order.itemID];

	if (VENDEE && item.image) {
		orderHTML += '<img style="border-radius: 50%" src="' + item.image + '">';
	} else if (VENDOR && item.initial) {
		orderHTML += '<img data-name="' + item.initial + '" class="initial uninitialized" style="border-radius: 50%">';
	} else {
		throw "Invalid module";
	}

	if (item.name) {
		orderHTML += '<h2>' + item.name + '</h2>';
	}

	orderHTML += generateOrderPropsHTML(order);
	orderHTML += generateOrderQuantityHTML(order);
	orderHTML += generateOrderStateHTML(order);

	orderHTML += '</a><a href="javascript:openOrderDialog(\'edit\', \'' + order.id + '\')" class="ui-btn ui-icon-edit">Edit</a></li>';

	return orderHTML;
}

function generateOrderPropsHTML(order) {
	var html = '<p class="ui-li-props">';
	html += generateOrderRequestHTML(order);
	html += generateOrderOptionsHTML(order);
	return html + '</p>';
}

function generateOrderRequestHTML(order) {
	if (order.request && order.request.length > 0) {
		return '<span name="request">' + order.request + '</span>';
	}
	return '';
}

function generateOrderOptionsHTML(order) {
	var html = '';
	if (order.options && order.options.length > 0) {
		for (var i = 0; i < order.options.length; ++i) {
			html += '<span name="option">' + order.options[i]  + '</span>';
		}
	}
	return html;
}

function generateOrderQuantityHTML(order) {
    if (order.quantity) {
        return '<span class="ui-li-quantity ui-body-inherit">' + order.quantity + ORDER_QUANTITY_POSTFIX + '</span>';
    }
	return '';
}

function generateOrderStateHTML(order) {
	return '<span class="ui-li-count">' + order.state + '</span>';
}

function openOrderDialog(view, orderID) {
	if (!_Group.orders.hasOwnProperty(orderID)) {
		console.warn('Order item "' + orderID + '" is not in the order');
		return;
	}

	var order = _Group.orders[orderID];
	var item = _MenuItems[order.itemID];
	var $dialog = $('#order [name="order"]');
	$dialog.find('h1[role="heading"]').text(item.name);

	var $main = $dialog.children('[data-role="main"]');
	$main.children('div').hide();	// hide all children

	showOrderContent(view);
	$dialog.popup("open");
	return;

	function showOrderContent(view) {
		var $div = $main.children('[name="' + view + '"]').hide();

		if (view === 'status') {
			$div.children('img[name="image"]').attr('src', item.image);
			if (order.quantity) {
				$div.children('span[name="quantity"]').text(order.quantity + ORDER_QUANTITY_POSTFIX).show();
			} else {
				$div.children('span[name="quantity"]').hide();
			}
			$div.children('[name="request"]').html(order.request ? order.request : '');
			$div.children('[name="state"]').html(order.state);
			
			$div.find('a[data-icon="edit"]').off('click').click(function() {
				$div.hide();
				showOrderContent('edit');
				$dialog.popup("reposition", {});
			});

			$div.find('a[data-icon="info"]').off('click').click(function() {
				$div.hide();
				showOrderContent('info');
				$dialog.popup("reposition", {});
			});
		} else if (view === 'info') {
			$div.children('img').attr('src', item.image);
			$div.children('p').text(item.desc ? item.desc : '');
			$div.find('a').off('click').click(function() {
				$div.hide();
				showOrderContent('status');
				$dialog.popup("reposition", {});
			});
		} else if (view === 'edit') {
			loadOrderInputs($div, order);

			var $form = $div.find("form");
			$form.find('a[name="delete"]').off("click").click(function() {
				_channel.publish(_GroupID, {
					script: "deleteOrder(message.data.orderID, message.name);",
					orderID: orderID,
				})
				deleteOrder(orderID);
			});

			$form.off("submit").submit(function() {
				var changedProps = fetchOrderInputs($div);
				changedProps.id = order.id;
				$.mobile.back();

				_channel.publish(_GroupID, {
					script: "updateOrder(message.data.changedProps, message.name);",
					changedProps: changedProps,
				});
				updateOrder(changedProps);
			});
		} else {
			throw 'Invalid dialog view: "' + view + "'";
		}

		$div.show();
	}
}

function updateOrder(changedProps) {
	var order = VENDOR ? _AllOrders[changedProps.id] : _Group.orders[changedProps.id];
	var oldOrder = clone(order);
	
	var $orderElement = $('#order-item-' + order.id + ',#queue-item-' + order.id);

	if (changedProps.state && changedProps.state != order.state) {
		changeOrderState(changedProps.id, changedProps.state);
		delete changedProps.state; // done with it
	}

	Object.assign(order, changedProps);
	
	// update order request
	if (changedProps.request != oldOrder.request) {
		var $el = $orderElement.find('a > p > span[name="request"]');
		if ($el.length > 0) {
			if (changedProps.request && changedProps.request.length > 0) {
				if ($el.text() != changedProps.request) {
					$el.fadeOut(function() {
						$el.text(changedProps.request);
						$el.fadeIn('slow').fadeOut().fadeIn('slow');
					});
				}
			} else {
				$el.fadeOut(1000, function() {
					// remove the item's DOM when animation complete
					$(this).remove();
				});
			}
		} else {
			if (changedProps.request && changedProps.request.length > 0) {
				$(generateOrderRequestHTML(changedProps)).appendTo($orderElement.find('a > p'))
						.hide().fadeIn(1000);
			}
		}
	}

	// update order quantity
	if (changedProps.quantity != oldOrder.quantity) {
		var $el = $orderElement.find('a > span.ui-li-quantity');
		if ($el.length > 0) {
			if (changedProps.quantity && changedProps.quantity > 1) {
				if ($el.text() != changedProps.quantity + ORDER_QUANTITY_POSTFIX) {
					$el.fadeOut(function() {
						$el.text(changedProps.quantity + ORDER_QUANTITY_POSTFIX);
						$el.fadeIn('slow').fadeOut().fadeIn('slow');
					});
				}
			} else {
				$el.fadeOut(1000, function() {
					// remove the item's DOM when animation complete
					$(this).remove();
				});
			}
		} else {
			if (changedProps.quantity && changedProps.quantity > 1) {
				$(generateOrderQuantityHTML(changedProps)).appendTo($orderElement.find('a'))
						.hide().fadeIn(1000);
			}
		}
	}

	// update order options
	if (!isOrderOptionsEqual(oldOrder, changedProps)) {
		var oldOptions = oldOrder.options ? oldOrder.options : [];
		var newOptions = changedProps.options ? changedProps.options : [];
		var optionsToRemove = oldOptions.filter(function(value) {
			return $.inArray(value, newOptions) < 0;
		});
		var optionsToInsert = newOptions.filter(function(value) {
			return $.inArray(value, oldOptions) < 0;
		});

		var $elmToRemove = $([]);
		if (optionsToRemove.length > 0) {
			$orderElement.find('a > p > span[name="option"]').each(function() {
				if ($.inArray($(this).text(), optionsToRemove) >= 0) {
					$elmToRemove = $elmToRemove.add(this);
				}
			});
		}

		$elmToRemove.fadeOut(1000).promise().done(function() {
			// remove the option's DOM when animation complete
			$(this).remove();

			if (optionsToInsert.length > 0) {
				$(generateOrderOptionsHTML({options: optionsToInsert}))
						.appendTo($orderElement.find('a > p'))
						.hide().fadeIn(1000);
			}
		});
	}
}

function deleteOrder(orderID, groupID) {
	if (_Group.orders.hasOwnProperty(orderID)) {
		delete _Group.orders[orderID];
	}

	if (VENDOR) {
		if (!groupID) {
			groupID = _AllOrders[orderID].groupID;
		}
		delete _OrderGroups[groupID].orders[orderID];
		delete _AllOrders[orderID];
	}
	
	var $orderElement = $('#order-item-' + orderID + ',#queue-item-' + orderID);
	$orderElement.children('a').off('click').attr('href', undefined);
	// animate the item out
	$orderElement.animate(
		{ height:0, opacity:0 },
		'slow', 'swing',
		function() {
			// remove the item's DOM when animation complete
			$(this).remove();
		}
	);
}

function createNewOrder(itemID) {
	return {
		id: generate_quick_guid(),
		created: (new Date).getTime(),
		itemID: itemID,
		state: OrderState.QUEUEING,
	};
}

function addNewOrder(order, groupID) {
	addNewOrders([order], groupID);
	return order;
}

function addNewOrders(orders, groupID) {
	if (!groupID) {
		groupID = _GroupID;
	}

	for (var i = 0; i < orders.length; ++i) {
		var order = orders[i];
		order.groupID = groupID;

		if (VENDOR) {
			_OrderGroups[groupID].orders[order.id] = order;
			_AllOrders[order.id] = order;

			var queueHTML = generateQueueItemHTML(order);
			$('#queue-list').append($(queueHTML));
		} else {
			_Group.orders[order.id] = order;
		}
		
		var orderHTML = generateOrderHTML(order);
		$(orderHTML).insertBefore('#new-order')

		$('#order-item-' + order.id + ',#queue-item-' + order.id).fadeOut().fadeIn('slow').fadeOut().fadeIn('slow');
	}

	var $list = $('#order-list,#queue-list');
	$list.listview().listview("refresh");

	if (VENDOR) {
		$list.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
			initial($(this));
		});
	}
}

function rejectOrder(orderID, reason) {
	var order = VENDOR ? _AllOrders[orderID] : _Group.orders[orderID];
	order.reason = reason;
	changeOrderState(orderID, OrderState.REJECTED)
}

function changeOrderState(orderID, newState) {
	var order = VENDOR ? _AllOrders[orderID] : _Group.orders[orderID];
	order.state = newState;

	if (VENDOR) {
		// TBD: should the queue get sorted on every state change?
		// onQueueStateChanged(order);

		var $orderElement = $('#queue-item-' + order.id + ',#order-item-' + order.id);

		var $actioNBtn = $orderElement.find('a[data-icon]');
		// temporary disable the link until button animation finish
		$actioNBtn.bind('click', false);

		$actioNBtn.fadeOut(function() {
			var nextState = getNextState(newState);
			var action = getStateAction(nextState);
			var icon = getIconNameForState(nextState);

			$actioNBtn.attr('class', $actioNBtn.attr('class').replace(/ui-icon-[^\s\\]+/, 'ui-icon-' + icon));
			$actioNBtn.attr('title', action);
			$actioNBtn.fadeIn('slow', function() {
				// button animation finish, re-enable the link
				$actioNBtn.unbind('click', false);
			});

			updateState();
		});
	} else {
		var $orderElement = $('#queue-item-' + order.id + ',#order-item-' + order.id);
		updateState();
	}

	function updateState() {
		var $stateEl = $orderElement.find('.ui-li-count');
		if ($stateEl.text() != newState) {
			$stateEl.fadeOut(function() {
				$stateEl.text(newState);
				if (shouldDisplayInQueue(newState)) {
					$stateEl.fadeIn('slow').fadeOut().fadeIn('slow');
				} else {
					$stateEl.fadeIn('slow').fadeOut().fadeIn('slow', function() {
						// remove the finished order in the queue, not in the order page
						var $orderElement = $('#queue-item-' + orderID);
						$orderElement.children('a').off('click').attr('href', undefined);
						// animate the item out
						$orderElement.animate(
							{ height:0, opacity:0 },
							'fast', 'swing',
							function() {
								// remove the item's DOM when animation complete
								$(this).remove();
								// make sure the content wrapper height is updated
								$orderElement.closest('.ui-content').enhanceWithin();
							}
						);
					});
				}
			});
		}
	}

	// TBD: should the queue get sorted on every state change?
	/*
	function onQueueStateChanged(order) {
		var $orderElement = $('#queue-item-' + order.id);
		var $oldOrderElement = $orderElement.clone();
		$oldOrderElement.removeAttr('id');

		var originalHeight = getRealHeight($orderElement[0]);
		$orderElement.height(0);
		$oldOrderElement.insertBefore('#queue-item-' + order.id);
		
		var beforeOrder = updateQueuePosition(order);
		if (beforeOrder) {
			$orderElement.insertBefore('#queue-item-' + beforeOrder.id);
		} else {
			$orderElement.appendTo('#queue-list');
		}

		$oldOrderElement.animate(
			{ height: 0 },
			'fast', 'swing',
			function() {
				// remove the item's DOM when animation complete
				$(this).remove();
			}
		);
		
		$orderElement.animate(
			{ height: originalHeight },
			'fast', 'swing',
			function() {
				$(this).find('a.ui-btn-active').removeClass('ui-btn-active');
			}
		);
	}

	function updateQueuePosition(changedOrder) {
		var moved = false;
		var orders = {};
		var beforeOrder;

		for (var orderID in _AllOrders) {
			var order = _AllOrders[orderID];

			if (order.id == changedOrder.id) {
				continue; // skip the old value
			} else if (!moved && compareOrder(changedOrder, order) < 0) {
				moved = true;
				orders[changedOrder.id] = changedOrder;
				beforeOrder = order;
			}

			orders[orderID] = order;
		}

		if (!moved) {
			orders[changedOrder.id] = changedOrder;
		}

		_AllOrders = orders;

		return beforeOrder;
	}
	*/
}

function shouldDisplayInQueue(state) {
	return state && state != OrderState.FINISHED && state !== OrderState.REJECTED;
}
