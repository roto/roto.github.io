
function populateOrder(groupID) {
	if (groupID) {
		_GroupID = groupID;
		_GroupOrders = _OrderGroups[groupID].orders;

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

	// TODO: use back ref to group, instead of duplicating all table display name to each orders
	var orderKeys = Object.keys(_GroupOrders);
	if (orderKeys.length > 0) {
		var dest = 'Table ' + _GroupOrders[orderKeys[0]].table;
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
	for (var id in _GroupOrders) {
		var order = _GroupOrders[id];
		ordersHTML += generateOrderHTML(order);
	}

	// add an big plus sign to add new order
	ordersHTML += '<li id="new-order"><a href="#menu" data-transition="slidefade"><div class="ui-li-thumb"><img src="http://library.austintexas.gov/sites/default/files/plus-gray.svg"></div></a></li>';

	return ordersHTML;
}

function generateOrderHTML(order) {
	var orderHTML = '<li id="order-item-' + order.id + '"><a href="javascript:openOrderDialog(\'status\', \'' + order.id + '\')">';

	if (VENDEE && order.item.image) {
		orderHTML += '<img style="border-radius: 50%" src="' + order.item.image + '">';
	} else if (VENDOR && order.item.initial) {
		orderHTML += '<img data-name="' + order.item.initial + '" class="initial uninitialized" style="border-radius: 50%">';
	} else {
		throw "Invalid module";
	}

	if (order.item.name) {
		orderHTML += '<h2>' + order.item.name + '</h2>';
	}

	orderHTML += generateOrderRequestHTML(order);
	orderHTML += generateOrderQuantityHTML(order);

	orderHTML += '<span class="ui-li-count">sending..</span>';
	orderHTML += '</a><a href="javascript:openOrderDialog(\'edit\', \'' + order.id + '\')" class="ui-btn ui-icon-edit">Edit</a></li>';

	return orderHTML;
}

function generateOrderRequestHTML(order) {
	if (order.request) {
		return '<p>' + order.request + '</p>';
	}
	return '';
}

function generateOrderQuantityHTML(order) {
    if (order.quantity) {
        return '<span class="ui-li-quantity ui-body-inherit">' + order.quantity + ORDER_QUANTITY_POSTFIX + '</span>';
    }
	return '';
}

function openOrderDialog(type, orderID) {
	if (!_GroupOrders.hasOwnProperty(orderID)) {
		console.warn('Order item "' + orderID + '" is not in the order');
		return;
	}

	var order = _GroupOrders[orderID];
	var $dialog = $('#dialog-order');
	$dialog.find('h1[role="heading"]').text(order.item.name);

	var $main = $dialog.children('[data-role="main"]');
	$main.children('div').hide();	// hide all children

	showOrderContent(type);
	$dialog.popup("open");
	return;

	function showOrderContent(type) {
		var $div = $main.children('#dialog-order-' + type).hide();

		if (type === 'status') {
			$div.children('img').attr('src', order.item.image);
			if (order.quantity) {
				$div.children('span').text(order.quantity + ORDER_QUANTITY_POSTFIX).show();
			} else {
				$div.children('span').hide();
			}
			$div.children('#dialog-order-status-request').html(order.request ? order.request : '');
			$div.children('#dialog-order-status-status').html(order.status ? order.status : 'Queueing');
			
			$div.find('a.ui-icon-edit').off('click').click(function() {
				$div.hide();
				showOrderContent('edit');
				$dialog.popup("reposition", {});
			});

			$div.find('a.ui-icon-info').off('click').click(function() {
				$div.hide();
				showOrderContent('info');
				$dialog.popup("reposition", {});
			});
		} else if (type === 'info') {
			$div.children('img').attr('src', order.item.image);
			$div.children('p').text(order.item.desc ? order.item.desc : '');
			$div.find('a').off('click').click(function() {
				$div.hide();
				showOrderContent('status');
				$dialog.popup("reposition", {});
			});
		} else if (type === 'edit') {
			loadRequestInputEvents($div, order.item.id, orderID);
			loadQuantityInputEvents($div, order.quantity);

			var $form = $div.find("form");
			$form.find('a#order-delete').off("click").click(function() {
				deleteOrder(orderID);
				_channel.publish(_GroupID, {
					script: "deleteOrder(message.data.orderID, message.name);",
					orderID: orderID,
				})
			});

			$form.off("submit").submit(function() {
				fetchOrderInputs(order, $div);
				$.mobile.back();

				updateOrder(order);
				_channel.publish(_GroupID, {
					script: "updateOrder(message.data.order, message.name);",
					order: order,
				});
			});
		} else {
			throw 'Invalid order dialog type: "' + type + "'";
		}

		$div.show();
	}
}

function updateOrder(order, groupID) {
	if (groupID) {
		_OrderGroups[groupID].orders[order.id] = order;
	} else {
		_GroupOrders[order.id] = order;
	}
	_AllOrders[order.id] = order;

	var $orderElement = $('#order-item-' + order.id + ',#queue-item-' + order.id);
	
	function updateOrderInputElements(property, selector, htmlGeneratorFunc, valuePostfix) {
		var $el = $orderElement.find(selector);
		if ($el.length > 0) {
			if (order[property]) {
				var valueWithPF = valuePostfix ? order[property] + valuePostfix : order[property];
				if ($el.text() != valueWithPF) {
					$el.text(valueWithPF);
					$el.fadeOut().fadeIn('slow').fadeOut().fadeIn('slow');
				}
			} else {
				$el.fadeOut(1000, function() {
					// remove the item's DOM when animation complete
					$(this).remove();
				});
			}
		} else {
			if (order[property]) {
				$(htmlGeneratorFunc(order))
						.insertAfter('#order-item-' + order.id + ' > a > h2,#queue-item-' + order.id + ' > a > h2')
						.hide().fadeIn(1000);
			}
		}
	}

	// update order request
	updateOrderInputElements('request', 'p', generateOrderRequestHTML);
	updateOrderInputElements('quantity', '.ui-li-quantity', generateOrderQuantityHTML, ORDER_QUANTITY_POSTFIX);
}

function deleteOrder(orderID, groupID) {
	if (groupID) {
		delete _OrderGroups[groupID].orders[orderID];
	} else {
		delete _GroupOrders[orderID];
	}
	delete _AllOrders[orderID];
	
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
		item: _MenuItems[itemID],
		state: OrderState.QUEUEING,
	};
}

function addNewOrder(order, groupID) {
	addNewOrders([order], groupID);
	return order;
}

function addNewOrders(orders, groupID) {
	for (var i = 0; i < orders.length; ++i) {
		var order = orders[i];

		if (groupID) {
			_OrderGroups[groupID].orders[order.id] = order;
		} else {
			_GroupOrders[order.id] = order;
		}
		
		var orderHTML = generateOrderHTML(order);
		$(orderHTML).insertBefore('#new-order')

		if (VENDOR) {
			_AllOrders[order.id] = order;
			var queueHTML = generateQueueItemHTML(order);
			$('#queue-list').append($(queueHTML));
		}

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
