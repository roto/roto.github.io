
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

function removeOrder(orderItemID) {
	if (!orderItems.hasOwnProperty(orderItemID)) {
		console.warn('Order item "' + orderItemID + '" is not in the order');
		return;
	}

	var orderItem = orderItems[orderItemID];

	// TODO: confirm dialog
	// TODO: remove the href:javascript and onclick event, before the animation
	// animate the item out
	$('#order-item-' + orderItemID).animate(
		{ height:0, opacity:0 },
		'slow',
		function() {
			// remove the item's DOM when animation complete
			$(this).remove();
		}
	);

	delete orderItems[orderItemID];
}

function generateOrderItemHTML(orderItem) {
	var orderItemHTML = '<li id="order-item-' + orderItem.id + '"><a href="#">';

	if (orderItem.item.image) {
		orderItemHTML += '<img style="border-radius: 50%" src="' + orderItem.item.image + '">';
	}

	if (orderItem.item.name) {
		orderItemHTML += '<h2>' + orderItem.item.name + '</h2>';
	}

	if (orderItem.request) {
		// show request
		orderItemHTML += '<p>' + orderItem.request + '</p>';
	}

    if (orderItem.quantity && orderItem.quantity > 1) {
        orderItemHTML += '<span class="ui-li-quantity ui-body-inherit">' + orderItem.quantity + ' &times;</span>';
    }

	orderItemHTML += '<span class="ui-li-count">sending..</span>';
	orderItemHTML += '</a><a href="javascript:removeOrder(\'' + orderItem.id + '\')" class="ui-btn ui-icon-edit">Edit</a></li>';

	return orderItemHTML;
}
