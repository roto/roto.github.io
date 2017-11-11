
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
	var orderHTML = '<li id="queue-item-' + order.id + '"><a href="javascript:openQueueDialog(\'edit\', \'' + order.id + '\')">';

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

function openQueueDialog(type, orderID) {
	if (!_GroupOrders.hasOwnProperty(orderID)) {
		console.warn('Order item "' + orderID + '" is not in the order');
		return;
	}

	var order = _GroupOrders[orderID];
	var $dialog = $('#dialog-queue');
	$dialog.find('h1[role="heading"]').text(order.item.name);

	var $main = $dialog.children('[data-role="main"]');
	$main.children('div').hide();	// hide all children

	showOrderContent(type);
	$dialog.popup("open");
	return;

	function showOrderContent(type) {
		var $div = $main.children('#dialog-queue-' + type).hide();

		if (type === 'status') {
			$div.children('img').attr('src', order.item.image);
			if (order.quantity) {
				$div.children('span').text(order.quantity + ORDER_QUANTITY_POSTFIX).show();
			} else {
				$div.children('span').hide();
			}
			$div.children('#dialog-queue-status-request').html(order.request ? order.request : '');
			$div.children('#dialog-queue-status-status').html(order.status ? order.status : 'Queueing');
			
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
				_channel.publish(_GroupID, {
					script: "deleteOrder(message.data.orderID, message.name);",
					orderID: orderID,
				})
				deleteOrder(orderID);
			});

			$form.off("submit").submit(function() {
				fetchOrderInputs(order, $div);
				$.mobile.back();

				_channel.publish(_GroupID, {
					script: "updateOrder(message.data.order, message.name);",
					order: order,
				});
				updateOrder(order);
			});
		} else {
			throw 'Invalid order dialog type: "' + type + "'";
		}

		$div.show();
	}
}
