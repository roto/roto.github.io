
function populateQueue() {
	var ordersHTML = '';

	// for all orders
	for (var orderID in _AllOrders) {
		var order = _AllOrders[orderID];
		order.state = order.state ? order.state : OrderState.QUEUEING;
		ordersHTML += generateQueueItemHTML(order);
	}

	$('ul#queue-list[data-role="listview"]').empty().append($(ordersHTML)).listview().listview("refresh");
}

function generateQueueItemHTML(order) {
	var orderHTML = '<li id="queue-item-' + order.id + '"><a href="javascript:openOrderDialog(\'status\', \'' + order.id + '\')">';

	if (order.item.initial) {
		orderHTML += '<img data-name="' + order.item.initial + '" class="initial" style="border-radius: 50%">';
	}

	if (order.item.name) {
		orderHTML += '<h2>' + order.item.name + '</h2>';
	}

	orderHTML += generateOrderRequestHTML(order);
	orderHTML += generateOrderQuantityHTML(order);
	orderHTML += generateQueueStateHTML(order);
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
	var newState = order.state = getNextState(order.state);

	var $orderElement = $('#queue-item-' + orderID);
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

		var $stateEl = $orderElement.find('.ui-li-count');
		if ($stateEl.text() != newState) {
			$stateEl.fadeOut(function() {
				$stateEl.text(newState);
				$stateEl.fadeIn('slow').fadeOut().fadeIn('slow');
			});
		}
	});
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

function generateQueueStateHTML(order) {
	return '<span class="ui-li-count">' + order.state + '</span>';
}

function generateQueueActionHTML(order) {
	var nextState = getNextState(order.state);
	var action = getStateAction(nextState);
	var icon = getIconNameForState(nextState);
	return '<a href="javascript:processNext(\'' + order.id + '\')" data-icon="' + icon +'">' + action + '</a></li>';
}

function generateQueueTableHTML(order) {
	if (order.table) {
		return '<span class="ui-li-table ui-body-inherit">' + order.table + '</span>';
	}
	return '';
}
