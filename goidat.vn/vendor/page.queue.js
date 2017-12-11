
function populateQueue() {
	var ordersHTML = '';

	// for all orders
	for (var orderID in _AllOrders) {
		var order = _AllOrders[orderID];
		if (shouldDisplayInQueue(order.state)) {
			ordersHTML += generateQueueItemHTML(order);
		}
	}

	$('ul#queue-list[data-role="listview"]').empty().append($(ordersHTML)).listview().listview("refresh")
			.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
				initial($(this));
			});
}

function generateQueueItemHTML(order) {
	var orderHTML = '<li id="queue-item-' + order.id + '"><a href="javascript:openQueueDialog(\'edit\', \'' + order.id + '\')">';

	var item = _MenuItems[order.itemID];

	if (item.initial) {
		orderHTML += '<img data-name="' + item.initial + '" class="initial uninitialized" style="border-radius: 50%">';
	}

	if (item.name) {
		orderHTML += '<h2>' + item.name + '</h2>';
	}

	orderHTML += generateOrderPropsHTML(order);
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
		script: "changeOrderState(message.data.orderID, message.data.newState);",
		orderID: orderID,
		newState: newState,
	});
	changeOrderState(orderID, newState);
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

function openQueueDialog(view, orderID) {
	if (!_AllOrders.hasOwnProperty(orderID)) {
		console.warn('Order item "' + orderID + '" is not in the queue');
		return;
	}

	var order = _AllOrders[orderID];
	var item = _MenuItems[order.itemID];
	var $dialog = $('#queue [name="order"]');
	$dialog.find('h1[role="heading"]').text(item.name);

	// tag the orderID in the dialog DOM for event handlers
	$dialog.data('orderID', orderID);

	var $main = $dialog.children('[data-role="main"]');
	$main.children('div').hide();	// hide all children

	showOrderContent(view);
	$dialog.popup("open");
	return;

	function showOrderContent(view) {
		var $div = $main.children('[name="' + view + '"]').hide();

		if (view === 'edit') {
			loadOrderInputs($div, order);

			var $form = $div.find('form');
			$form.find('a[name="reject"]').off("click").click(function() {
				$div.hide();
				showOrderContent('reject');
				$dialog.popup("reposition", {});
			});

			$form.off("submit").submit(function() {
				var changedProps = fetchOrderInputs($div);
				changedProps.id = order.id;
				$.mobile.back();

				_channel.publish(_GroupID, {
					script: 'updateOrder(message.data.changedProps, message.name);',
					changedProps: changedProps,
				});
				updateOrder(changedProps);
			});
		} else if (view == 'reject') {
			var $form = $div.find('form');
			var $reasonInput = $form.find('input[name="reason"]');
			$reasonInput.val('');

			$form.find('a[name="cancel"]').off('click').click(function() {
				$div.hide();
				showOrderContent('edit');
				$dialog.popup("reposition", {});
			});

			$form.off('submit').submit(function() {
				var reason = $reasonInput.val()

				_channel.publish(_GroupID, {
					script: 'rejectOrder(message.data.orderID, message.data.reason);',
					orderID: order.id,
					reason: reason,
				})
				rejectOrder(order.id, reason);
				$.mobile.back();
			});
		} else {
			throw 'Invalid dialog view: "' + view + '"';
		}

		$div.show();
	}
}

function onQueueDialogOrderButtonGroupClick(button) {
	var $dialog = $(button).closest('[data-role="popup"]');
	var orderID = $dialog.data('orderID');
	var order = _AllOrders[orderID];
	navigateToOrder(order.groupID);
}
