
function populateQuickMenu() {
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
	$('ul#menu-list[data-role="listview"]').empty().append($(groupsHTML)).listview().listview("refresh")
			.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
				initial($(this));
			});
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
		var orderItem = $this.data('orderItem');

		if(orderItem && orderItem.item.id === itemID && !orderItem.request) {
			var currentQuantity = orderItem.quantity;

			// register the Undo action
			historyAdd(function() {
				setPreviewQuantity($this, currentQuantity);
			});

			if (!orderItem.quantity) {
				orderItem.quantity = 2;
			} else {
				++orderItem.quantity;
			}

			setPreviewQuantity($this, orderItem.quantity);

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

		addPreviewItemInside($ul, $item, createNewOrderItem(itemID));

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

function addPreviewItemBefore($next, $item, orderItem) {
	if (orderItem) {
		$item.data('orderItem', orderItem);
	}

	onNewPreviewItem($item.insertBefore($next));
}

function addPreviewItemInside($parent, $item, orderItem) {
	if (orderItem) {
		$item.data('orderItem', orderItem);
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

function setPreviewQuantity($item, quantity) {
	$item.data('orderItem').quantity = quantity;

	var $span = $item.children('span');
	$span.text(quantity);

	if (quantity > 1) {
		$span.css('visibility', 'visible');
	} else {
		$span.css('visibility', 'hidden');
	}
}

function setPreviewRequest($item, request) {
	$item.data('orderItem').request = request;
	var color = (request && request.length > 0) ? hash_to_rbg(hash_code(request)) : 'transparent';
	$item.children('a').first().css('background-color', color);
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

function openQuickMenuDialog(link) {
	var $item = $(link).parent();
	var orderItem = $item.data('orderItem');

	var $dialog = $('#dialog-menu');
	$dialog.find('h1').text(orderItem.item.name);

	var $main = $dialog.children('[data-role="main"]');
	$main.children('div').hide();	// hide all children

	showQuickMenuContent('edit');
	$dialog.popup('open');
	return;

	function showQuickMenuContent(type) {
		var $div = $main.children('#dialog-menu-' + type).hide();

		if (type === 'edit') {
			loadRequestInputEvents($div, orderItem.item.id, orderItem.id);
			loadQuantityInputEvents($div, orderItem.quantity);

			var $form = $div.find("form");
			$form.find('a#order-delete').off("click").click(function() {
				var orderItem = $item.data('orderItem');
				var $ul = $item.parent();
				var $next = $item.next();

				if ($next.length > 0) {
					historyAdd(function() {
						addPreviewItemBefore($next, $item, orderItem);
					});
				} else {
					historyAdd(function() {
						addPreviewItemInside($ul, $item, orderItem);
					});
				}

				removePreviewItem($ul, $item);
			});

			$form.off("submit").submit(function() {
				var quantity = orderItem.quantity;
				var request = orderItem.request;

				fetchOrderInputs(orderItem, $div);
				$.mobile.back();

				var quantityChanged = quantity != orderItem.quantity;
				var requestChanged = request !== orderItem.request;

				if (quantityChanged || requestChanged) {
					historyAdd(function() {
						setPreviewQuantity($item, quantity);
						setPreviewRequest($item, request);
					});

					setPreviewQuantity($item, orderItem.quantity);
					setPreviewRequest($item, orderItem.request);
				}
			});
		} else {
			throw 'Invalid order dialog type: "' + type + "'";
		}

		$div.show();
	}
}
