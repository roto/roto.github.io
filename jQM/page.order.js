
function populateOrder() {
	var orderItemsHTML = '';

	// for each menu's groups
	for (var i in initialOrderItems) {
		var initialOrderItem = initialOrderItems[i];
		var orderItem = createNewOrderItem(initialOrderItem.itemID);
		if (initialOrderItem.request) {
			orderItem.request = initialOrderItem.request;
		}
		if (initialOrderItem.quantity) {
			orderItem.quantity = initialOrderItem.quantity;
		}
		orderItemsHTML += generateOrderItemHTML(orderItem);
	}

	// done with the initial orders
	delete initialOrderItems;

	// add an big plus sign to add new order
	orderItemsHTML += '<li id="new-order"><a href="#menu" data-transition="slidefade"><div class="ui-li-thumb"><img src="http://library.austintexas.gov/sites/default/files/plus-gray.svg"></div></a></li>';

	$('ul#order-list[data-role="listview"]').empty().append($(orderItemsHTML)).listview().listview("refresh");
}

function createNewOrderItem(itemID) {
	var orderItem = {
		id: generateOrderItemID(itemID),
		item: menuItems[itemID],
	};
	return orderItems[orderItem.id] = orderItem;
}

function generateOrderItemID(itemID) {
	var item = menuItems[itemID];

	if (!item.orderCount) {
		item.orderCount = 1;
		return itemID;
	}

	return itemID + '-' + (++item.orderCount);
}

function orderEditDialog(orderItemID) {
	var orderItem = orderItems[orderItemID];

	if (!orderItems.hasOwnProperty(orderItemID)) {
		console.warn('Order item "' + orderItemID + '" is not in the order');
		return;
	}

	var $dialog = $("#order-edit-dialog");
	$dialog.find('h1[role="heading"]').text(orderItem.item.name);

	loadRequestInputEvents($dialog, orderItem.item.id, orderItemID);
	loadQuantityInputEvents($dialog, orderItem.quantity);

	$dialog.popup("open");

	var $form = $dialog.find("form#order-edit-form");
	$form.find('a#order-delete').off("click").on("click", function() {
		delete orderItems[orderItemID];

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
		fetchOrderInputs(orderItem, $dialog);
		$.mobile.back();
		var $orderElement = $('#order-item-' + orderItemID);

		function updateOrderInputElements(property, selector, htmlGeneratorFunc, valuePostfix) {
			var $el = $orderElement.find(selector);
			if ($el.length > 0) {
				if (orderItem[property]) {
					var valueWithPF = valuePostfix ? orderItem[property] + valuePostfix : orderItem[property];
					if ($el.text() != valueWithPF) {
						$el.text(valueWithPF);
						$el.fadeOut('slow').fadeIn('slow').fadeOut('slow').fadeIn('slow');
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
		updateOrderInputElements('quantity', '.ui-li-quantity', generateOrderQuantityHTML, ' ×');
	});
}

function orderAddNew(orderItem) {
	var orderItemHTML = generateOrderItemHTML(orderItem);
	$(orderItemHTML).insertBefore('#new-order');
	$('ul#order-list[data-role="listview"]').listview().listview("refresh");
	window.history.go(-2);
	$('#order-item-' + orderItem.id).fadeOut('slow').fadeIn('slow').fadeOut('slow').fadeIn('slow');
}

function generateOrderItemHTML(orderItem) {
	var orderItemHTML = '<li id="order-item-' + orderItem.id + '"><a href="#">';

	if (orderItem.item.image) {
		orderItemHTML += '<img style="border-radius: 50%" src="' + orderItem.item.image + '">';
	}

	if (orderItem.item.name) {
		orderItemHTML += '<h2>' + orderItem.item.name + '</h2>';
	}

	orderItemHTML += generateOrderRequestHTML(orderItem);
	orderItemHTML += generateOrderQuantityHTML(orderItem);

	orderItemHTML += '<span class="ui-li-count">sending..</span>';
	orderItemHTML += '</a><a href="javascript:orderEditDialog(\'' + orderItem.id + '\')" class="ui-btn ui-icon-edit">Edit</a></li>';

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
        return '<span class="ui-li-quantity ui-body-inherit">' + orderItem.quantity + ' &times;</span>';
    }
	return '';
}
