
function populateOrder(groupGUID) {
	_GroupOrders = _OrderGroups[groupGUID].orders;

	populateOrderHeader(groupGUID);

	var orderItemsHTML = '';

	// for each menu's groups
	for (var id in _GroupOrders) {
		var orderItem = _GroupOrders[id];
		orderItemsHTML += generateOrderItemHTML(orderItem);
	}

	// add an big plus sign to add new order
	orderItemsHTML += '<li id="new-order"><a href="#menu" data-transition="slidefade"><div class="ui-li-thumb"><img src="http://library.austintexas.gov/sites/default/files/plus-gray.svg"></div></a></li>';

	$('ul#order-list[data-role="listview"]').empty().append($(orderItemsHTML)).listview().listview("refresh")
			.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
				initial($(this));
			});
}

function populateOrderHeader(groupGUID) {
	var $div = $('#order > div[data-role="subheader"]');
	var html = '<div data-role="delivery-table" align="center"><fieldset data-role="controlgroup" data-type="horizontal">';

	var group = _OrderGroups[groupGUID];
	for (var i in group.tables) {
		var floorID = group.tables[i].floor;
		var floor = _DeliveryData[floorID];
		if (!floor) {
			throw "Floor not exist: " + floorID;
		}

		for (var j in group.tables[i].seats) {
			var seatID = group.tables[i].seats[j];
			var seat = floor.seats[seatID];
			if (!seat) {
				throw "Seat not exist: " + seatID + " on floor " + floorID;
			}

			html += '<input type="button" value="' + seat.displayName + '"';
			html += ' style="background-color:' + hash_to_rbg(hash_code(groupGUID)) + '">';
		}
	}

	html += '</fieldset></div>';

	$div.html(html).enhanceWithin();
}

function createNewOrderItem(itemID) {
	return {
		id: generate_quick_guid(),
		created: (new Date).getTime(),
		item: _MenuItems[itemID],
	};
}

function addNewOrderItem(itemID) {
	var orderItem = createNewOrderItem(itemID);
	_GroupOrders[orderItem.id] = orderItem;
	return orderItem;
}

function openOrderDialog(type, orderItemID) {
	if (!_GroupOrders.hasOwnProperty(orderItemID)) {
		console.warn('Order item "' + orderItemID + '" is not in the order');
		return;
	}

	var orderItem = _GroupOrders[orderItemID];
	var $dialog = $('#dialog-order');
	$dialog.find('h1[role="heading"]').text(orderItem.item.name);

	var $main = $dialog.children('[data-role="main"]');
	$main.children('div').hide();	// hide all children

	showOrderContent(type);
	$dialog.popup("open");
	return;

	function showOrderContent(type) {
		var $div = $main.children('#dialog-order-' + type).hide();

		if (type === 'status') {
			$div.children('img').attr('src', orderItem.item.image);
			if (orderItem.quantity) {
				$div.children('span').text(orderItem.quantity + ORDER_QUANTITY_POSTFIX).show();
			} else {
				$div.children('span').hide();
			}
			$div.children('#dialog-order-status-request').html(orderItem.request ? orderItem.request : '');
			$div.children('#dialog-order-status-status').html(orderItem.status ? orderItem.status : 'Queueing');
			
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
			$div.children('img').attr('src', orderItem.item.image);
			$div.children('p').text(orderItem.item.desc ? orderItem.item.desc : '');
			$div.find('a').off('click').click(function() {
				$div.hide();
				showOrderContent('status');
				$dialog.popup("reposition", {});
			});
		} else if (type === 'edit') {
			loadRequestInputEvents($div, orderItem.item.id, orderItemID);
			loadQuantityInputEvents($div, orderItem.quantity);

			var $form = $div.find("form");
			$form.find('a#order-delete').off("click").click(function() {
				delete _GroupOrders[orderItemID];

				var $orderElement = $('#order-item-' + orderItemID);
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
			});

			$form.off("submit").submit(function() {
				fetchOrderInputs(orderItem, $div);
				$.mobile.back();
				var $orderElement = $('#order-item-' + orderItemID + ',#queue-item-' + orderItemID);

				function updateOrderInputElements(property, selector, htmlGeneratorFunc, valuePostfix) {
					var $el = $orderElement.find(selector);
					if ($el.length > 0) {
						if (orderItem[property]) {
							var valueWithPF = valuePostfix ? orderItem[property] + valuePostfix : orderItem[property];
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
						if (orderItem[property]) {
							$(htmlGeneratorFunc(orderItem)).insertAfter('#order-item-' + orderItemID + ' > a > h2').hide().fadeIn(1000);
						}
					}
				}

				// update order request
				updateOrderInputElements('request', 'p', generateOrderRequestHTML);
				updateOrderInputElements('quantity', '.ui-li-quantity', generateOrderQuantityHTML, ORDER_QUANTITY_POSTFIX);
			});
		} else {
			throw 'Invalid order dialog type: "' + type + "'";
		}

		$div.show();
	}
}

function generateOrderItemHTML(orderItem) {
	var orderItemHTML = '<li id="order-item-' + orderItem.id + '"><a href="javascript:openOrderDialog(\'status\', \'' + orderItem.id + '\')">';

	if (orderItem.item.initial) {
		orderItemHTML += '<img data-name="' + orderItem.item.initial + '" class="initial uninitialized" style="border-radius: 50%">';
	}

	if (orderItem.item.name) {
		orderItemHTML += '<h2>' + orderItem.item.name + '</h2>';
	}

	orderItemHTML += generateOrderRequestHTML(orderItem);
	orderItemHTML += generateOrderQuantityHTML(orderItem);

	orderItemHTML += '<span class="ui-li-count">sending..</span>';
	orderItemHTML += '</a><a href="javascript:openOrderDialog(\'edit\', \'' + orderItem.id + '\')" class="ui-btn ui-icon-edit">Edit</a></li>';

	return orderItemHTML;
}

function generateOrderRequestHTML(orderItem) {
	if (orderItem.request) {
		return '<p>' + orderItem.request + '</p>';
	}
	return '';
}

function generateOrderQuantityHTML(orderItem) {
    if (orderItem.quantity) {
        return '<span class="ui-li-quantity ui-body-inherit">' + orderItem.quantity + ORDER_QUANTITY_POSTFIX + '</span>';
    }
	return '';
}
