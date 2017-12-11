
function populateQuickMenu() {
	var $page = $('#menu');
	try {
		$page.page('destroy');
	} catch (err) {
		if (err.message.indexOf('prior to initialization') >= 0) {
			// page might not be initilized, ignore and continue
		} else {
			throw err;
		}
	}

	var groupsHTML = '';

	// for each menu's groups
	for (var idx = 0; idx < _MenuGroups.length; ++idx) {
		var group = _MenuGroups[idx];
		if (typeof group === 'undefined' || typeof group.items === 'undefined' || group.items.length === 0) {
			// group.items is not defined or empty
			continue;
		}

		if (!group.nofilter) {
			groupsHTML += generateQuickMenuGroupHTML(group);
		}
	}

	// append the collapsible group div
	$('ul#menu-list[data-role="listview"]').empty().append($(groupsHTML))//.listview().listview("refresh")
			.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
				initial($(this));
			});

	$page.page();
}

function generateQuickMenuGroupHTML(group) {
	var groupHTML = '';
	var groupFilterText = group.nofilter ? '|' : ''; // put an useless | to disable group filter

	// create the group name
	if (group.name) {
		groupHTML += '<h4>' + group.name + '</h4>';
		if (!group.nofilter) {
			groupFilterText += '|' + getFilterText(group.name);
		}
	}

	// create each item LI
	var itemsHTML = '';

	// for each group's items
	for (var i = 0; i < group.items.length; ++i) {
		var itemID = group.items[i];
		var item = _MenuItems[itemID];
		if (!item.id) {
			// make sure the item.id is set
			item.id = itemID;
		}

		generateMenuItemFilterText(item, !group.nofilter, true);
		itemsHTML += generateQuickMenuItemHTML(item);
		groupFilterText += item.filterText;
	}

	// nested items UL
	groupHTML += '<ul data-role="listview" data-inset="true"><fieldset data-role="controlgroup" data-type="horizontal">' + itemsHTML + '</fieldset></ul>';

	// generate the collapsible group div with data-filtertext
	var groupHTMLPrefix = '<div data-role="collapsible" data-collapsed="false" id="group-' + group.id + '"';
	if (groupFilterText.length > 0) {
		groupHTMLPrefix += ' data-filtertext="' + groupFilterText + '"';
	}
	groupHTML = groupHTMLPrefix + '>' + groupHTML + '</div>';

	return groupHTML;
}

function generateQuickMenuItemHTML(item) {
	var itemHTML = '<a href="javascript:menuItemClick(\'' + item.id + '\')">';
	itemHTML += '<img data-name="' + item.initial + '" class="initial uninitialized" style="border-radius: 50%">';
	itemHTML += '</a>';

	if (item.filterText.length > 0) {
		itemHTML = '<li id="item-' + item.id + '" data-filtertext="' + item.filterText + '">' + itemHTML + '</li>';
	} else {
		itemHTML = '<li id="item-' + item.id + '">' + itemHTML + '</li>';
	}

	return itemHTML;
}

function menuItemClick(itemID) {
	var item = _MenuItems[itemID];
	var $ul = $('#order-preview-list');
	var itemExist = false;

	$ul.children('li').each(function(index) {
		var $this = $(this);
		var order = $this.data('order');

		if(order && order.itemID === itemID && !isOrderHasProps(order)) {
			var currentQuantity = order.quantity;

			// register the Undo action
			historyAdd(function() {
				updatePreviewQuantity($this, currentQuantity);
			});

			if (!order.quantity) {
				order.quantity = 2;
			} else {
				++order.quantity;
			}

			updatePreviewQuantity($this, order.quantity);

			itemExist = true;
			return false; // stop processing the next .each() iteration
		}
	});

	if (!itemExist) {
		var html = generateQuickMenuPreviewItemHTML(item);
		var $item = $(html);

		historyAdd(function() {
			removePreviewItem($ul, $item);
		});

		addPreviewItemInside($ul, $item, createNewOrder(itemID));

		// BUG: QuickMenu is not rendered correctly after add order preview
		// 		Smallscree, long quick menu list. Tap an item to preview order.
		//$('#menu-list').listview("refresh");
		//$('#menu').trigger('refresh');
	}
}

function removePreviewItem($ul, $item) {
	$item.remove();
	
	if ($ul.children('li').length == 0) {
		$('#order-preview-panel').hide();
		$('#action-preview-clear').addClass('ui-disabled');
		$('#action-preview-accept').addClass('ui-disabled');
	}
}

function addPreviewItemBefore($next, $item, order) {
	if (order) {
		$item.data('order', order);
	}

	onNewPreviewItem($item.insertBefore($next));
}

function addPreviewItemInside($parent, $item, order) {
	if (order) {
		$item.data('order', order);
	}

	onNewPreviewItem($parent.append($item));
}

function onNewPreviewItem($item) {
	$item.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
		initial($(this));
	});

	var $panel = $('#order-preview-panel');
	if (!$panel.is(":visible")) {
		$panel.show();
		$('#action-preview-clear').removeClass('ui-disabled');
		$('#action-preview-accept').removeClass('ui-disabled');
	}
}

function updatePreviewProps($item, props) {
	var order = Object.assign($item.data('order'), props);
	var propsHash = getOrderHash(order);
	$item.children('a').first().css('background-color', propsHash ? hash_to_rbg(propsHash) : 'transparent');
}

function updatePreviewQuantity($item, quantity) {
	$item.data('order').quantity = quantity;

	if (quantity) {
		var $span = $item.children('span');
		$span.text(quantity);

		if (quantity > 1) {
			$span.css('visibility', 'visible');
		} else {
			$span.css('visibility', 'hidden');
		}
	}
}

function historyAdd(action) {
	action.next = historyAdd.current;
	historyAdd.current = action;
	$('#action-preview-undo').removeClass('ui-disabled');
}

function historyUndo() {
	if (historyAdd.current) {
		historyAdd.current();
		historyAdd.current = historyAdd.current.next;
	}

	if (!historyAdd.current) {
		$('#action-preview-undo').addClass('ui-disabled');
	}
}

function historyClear() {
	delete historyAdd.current;
	$('#action-preview-undo').addClass('ui-disabled');
}

function generateQuickMenuPreviewItemHTML(item) {
	var itemHTML = '<li id="item-' + item.id + '"><a href="#" onclick="openQuickMenuDialog(this);">';
	itemHTML += '<img data-name="' + item.initial + '" class="initial uninitialized" style="border-radius: 50%">';
	itemHTML += '</a><span class="ui-li-quantity ui-body-inherit" style="visibility:hidden">0</span></li>';

	return itemHTML;
}

function clearPreviewList() {
	// TODO: undo support
	// save all orderData of the items for later undo actions
	historyClear();

	var $panel = $('#order-preview-panel');
	if ($panel.is(":visible")) {
		$panel.hide();
		$('#action-preview-clear').addClass('ui-disabled');
		$('#action-preview-accept').addClass('ui-disabled');
	}

	$('#order-preview-list').empty();
}

function acceptPreviewList() {
	var orders = [];
	$('#order-preview-list').children('li').each(function(index) {
		var $this = $(this);
		var order = $this.data('order');

		if (order) {
			orders.push(order);
		}
	});

	_channel.publish(_GroupID, {
		script: "addNewOrders(message.data.orders, message.name);",
		orders: orders,
	})
	addNewOrders(orders);
	
	clearPreviewList();
}

function openQuickMenuDialog(link) {
	var $item = $(link).parent();
	var order = $item.data('order');
	var item = _MenuItems[order.itemID];

	var $dialog = $('#dialog-menu');
	$dialog.find('h1').text(item.name);

	var $main = $dialog.children('[data-role="main"]');
	$main.children('div').hide();	// hide all children

	showQuickMenuContent('edit');
	$dialog.popup('open');
	return;

	function showQuickMenuContent(type) {
		var $div = $main.children('#dialog-menu-' + type).hide();

		if (type === 'edit') {
			loadOrderInputs($div, order);

			var $form = $div.find("form");
			$form.find('a#order-delete').off("click").click(function() {
				var order = $item.data('order');
				var $ul = $item.parent();
				var $next = $item.next();

				if ($next.length > 0) {
					historyAdd(function() {
						addPreviewItemBefore($next, $item, order);
					});
				} else {
					historyAdd(function() {
						addPreviewItemInside($ul, $item, order);
					});
				}

				removePreviewItem($ul, $item);
			});

			$form.off("submit").submit(function() {
				var props = Object.assign({}, fetchOrderInputs($div));
				$.mobile.back();

				if (props.quantity != order.quantity || !isOrderPropsEqual(props, order)) {
					var oldQuantity = order.quantity;

					with({oldProps: {
						request: order.request,
						options: order.options ? order.options.slice() : null,
					}}) {
						historyAdd(function() {
							updatePreviewQuantity($item, oldQuantity);
							updatePreviewProps($item, oldProps);
						});
					}

					updatePreviewQuantity($item, props.quantity);
					updatePreviewProps($item, props);
				}
			});
		} else {
			throw 'Invalid order dialog type: "' + type + "'";
		}

		$div.show();
	}
}
