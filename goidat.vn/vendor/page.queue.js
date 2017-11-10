
function populateQueue() {
	var ordersHTML = '';

	// for all orders
	for (var orderID in _AllOrders) {
		var order = _AllOrders[orderID];
		if (order.state && order.state != OrderState.FINISHED) {
			ordersHTML += generateQueueItemHTML(order);
		}
	}

	$('ul#queue-list[data-role="listview"]').empty().append($(ordersHTML)).listview().listview("refresh");
}

function generateQueueItemHTML(order) {
	var orderHTML = '<li id="queue-item-' + order.id + '"><a href="javascript:openOrderDialog(\'status\', \'' + order.id + '\')">';

	if (order.item.initial) {
		orderHTML += '<img data-name="' + order.item.initial + '" class="initial uninitialized" style="border-radius: 50%">';
	}

	if (order.item.name) {
		orderHTML += '<h2>' + order.item.name + '</h2>';
	}

	orderHTML += generateOrderRequestHTML(order);
	orderHTML += generateOrderQuantityHTML(order);
	orderHTML += generateOrderStateHTML(order);
	orderHTML += generateQueueTableHTML(order);

	orderHTML += '</a>';
	orderHTML += generateQueueActionHTML(order);

	return orderHTML;
}

function processNext(orderID) {
	if (!_AllOrders.hasOwnProperty(orderID)) {
		console.warn('Order item "' + orderID + '" is not in the order');
		return;
	}

	var order = _AllOrders[orderID];
	var newState = getNextState(order.state);
	
	_channel.publish(order.groupID, {
		script: "processNextOrderState(message.data.orderID, message.data.newState);",
		orderID: orderID,
		newState: newState,
	});
	processNextOrderState(orderID, newState);
}

function getNextState(state) {
	switch (state) {
		case OrderState.QUEUEING:	return OrderState.PROCESSING;
		case OrderState.PROCESSING:	return OrderState.SERVING;
		case OrderState.SERVING:	return OrderState.FINISHED;
	}
}

function getStateAction(state) {
	switch (state) {
		case OrderState.QUEUEING:	return "Queue";
		case OrderState.PROCESSING:	return "Process";
		case OrderState.SERVING:	return "Serve";
		case OrderState.FINISHED:	return "Finish";
	}
}

function getIconNameForState(state) {
	switch (state) {
		case OrderState.QUEUEING:	return "plus";
		case OrderState.PROCESSING:	return "action";
		case OrderState.SERVING:	return "navigation";
		case OrderState.FINISHED:	return "check";
		default:					return "forbidden";
	}
}

function generateQueueActionHTML(order) {
	var nextState = getNextState(order.state);
	var action = getStateAction(nextState);
	var icon = getIconNameForState(nextState);
	return '<a href="javascript:processNext(\'' + order.id + '\')" data-icon="' + icon +'">' + action + '</a></li>';
}

function generateQueueTableHTML(order) {
	if (_OrderGroups[order.groupID].tableToDisplay) {
		return '<span class="ui-li-table ui-body-inherit">' + _OrderGroups[order.groupID].tableToDisplay + '</span>';
	}
	return '';
}
