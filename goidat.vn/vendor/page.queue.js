
function populateQueue() {
	var orderItemsHTML = '';

	// for each menu's groups
	for (var i in initialAllOrderItems) {
		var initialOrderItem = initialAllOrderItems[i];
		var orderItem = createNewOrderItem(initialOrderItem.itemID);
		if (initialOrderItem.request) {
			orderItem.request = initialOrderItem.request;
		}
		if (initialOrderItem.quantity) {
			orderItem.quantity = initialOrderItem.quantity;
		}
		if (initialOrderItem.table) {
			orderItem.table = initialOrderItem.table;
		}
		orderItem.state = initialOrderItem.state ? initialOrderItem.state : OrderState.QUEUEING;
		orderItemsHTML += generateQueueItemHTML(orderItem);
	}

	// done with the initial orders
	delete initialAllOrderItems;

	// add an big plus sign to add new order
	orderItemsHTML += '<li id="new-order"><a href="#menu" data-transition="slidefade"><div class="ui-li-thumb"><img src="http://library.austintexas.gov/sites/default/files/plus-gray.svg"></div></a></li>';

	$('ul#queue-list[data-role="listview"]').empty().append($(orderItemsHTML)).listview().listview("refresh");
}

function openOrderDialog(type, orderItemID) {
	if (!orderItems.hasOwnProperty(orderItemID)) {
		console.warn('Order item "' + orderItemID + '" is not in the order');
		return;
	}

	var orderItem = orderItems[orderItemID];
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
				$div.children('span').text(orderItem.quantity).show();
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
				fetchOrderInputs(orderItem, $div);
				$.mobile.back();
				var $orderElement = $('#order-item-' + orderItemID);

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
				updateOrderInputElements('quantity', '.ui-li-quantity', generateOrderQuantityHTML);
			});
		} else {
			throw 'Invalid order dialog type: "' + type + "'";
		}

		$div.show();
	}
}

function generateQueueItemHTML(orderItem) {
	var orderItemHTML = '<li id="order-item-' + orderItem.id + '"><a href="javascript:openOrderDialog(\'status\', \'' + orderItem.id + '\')">';

	if (orderItem.item.initial) {
		orderItemHTML += '<img data-name="' + orderItem.item.initial + '" class="initial" style="border-radius: 50%">';
	}

	if (orderItem.item.name) {
		orderItemHTML += '<h2>' + orderItem.item.name + '</h2>';
	}

	orderItemHTML += generateOrderRequestHTML(orderItem);
	orderItemHTML += generateQueueQuantityHTML(orderItem);
	orderItemHTML += generateQueueStateHTML(orderItem);
	orderItemHTML += generateQueueTableHTML(orderItem);

	orderItemHTML += '</a>';
	orderItemHTML += generateQueueActionHTML(orderItem);

	return orderItemHTML;
}

function processNext(orderItemID) {
	if (!orderItems.hasOwnProperty(orderItemID)) {
		console.warn('Order item "' + orderItemID + '" is not in the order');
		return;
	}

	var orderItem = orderItems[orderItemID];
	var newState = orderItem.state = getNextState(orderItem.state);

	var $orderElement = $('#order-item-' + orderItemID);
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

function generateQueueQuantityHTML(orderItem) {
    if (orderItem.quantity) {
        return '<span class="ui-li-quantity ui-body-inherit">' + orderItem.quantity + '</span>';
    }
	return '';
}

function generateQueueStateHTML(orderItem) {
	return '<span class="ui-li-count">' + orderItem.state + '</span>';
}

function generateQueueActionHTML(orderItem) {
	var nextState = getNextState(orderItem.state);
	var action = getStateAction(nextState);
	var icon = getIconNameForState(nextState);
	return '<a href="javascript:processNext(\'' + orderItem.id + '\')" data-icon="' + icon +'">' + action + '</a></li>';
}

function generateQueueTableHTML(orderItem) {
	if (orderItem.table) {
		return '<span class="ui-li-table ui-body-inherit">' + orderItem.table + '</span>';
	}
	return '';
}
