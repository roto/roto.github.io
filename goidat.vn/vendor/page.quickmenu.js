
function populateQuickMenu() {
	var groupsHTML = '';

	// for each menu's groups
	for (var idx = 0; idx < menuGroups.length; ++idx) {
		var group = menuGroups[idx];
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
		var item = menuItems[itemID];
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
	var item = menuItems[itemID];
	var $ul = $('#order-preview-list');
	var itemExist = false;

	$ul.children('li').each(function(index) {
		var $this = $(this);
		var orderItem = $this.data('orderItem');
		if(orderItem && orderItem.item.id === itemID && !orderItem.request) {
			if (!orderItem.quantity) {
				orderItem.quantity = 2;
			} else {
				++orderItem.quantity;
			}

			var $span = $this.children('span');
			$span.text(orderItem.quantity);

			if (orderItem.quantity > 1) {
				$span.css('visibility', 'visible');
			} else {
				$span.css('visibility', 'hidden');
			}

			itemExist = true;
			return false; // stop processing the next .each() iteration
		}
	});

	if (!itemExist) {
		var html = generateQuickMenuPreviewItemHTML(item);
		var $item = $(html);
		$item.data('orderItem', createNewOrderItem(itemID));

		$ul.append($item).find('.initial.uninitialized').removeClass('uninitialized').each(function() {
			initial($(this));
		});

		var $panel = $('#order-preview-panel');
		if (!$panel.is(":visible")) {
			$panel.show();
		}

		// BUG: QuickMenu is not rendered correctly after add order preview
		// 		Smallscree, long quick menu list. Tap an item to preview order.
		//$('#menu-list').listview("refresh");
		$('#menu').trigger('refresh');
	}
}

function generateQuickMenuPreviewItemHTML(item) {
	var itemHTML = '<li id="item-' + item.id + '"><a href="javascript:openQuickMenuDialog(\'new\', \'' + item.id + '\')">';
	itemHTML += '<img data-name="' + item.initial + '" class="initial uninitialized" style="border-radius: 50%">';
	itemHTML += '</a><span class="ui-li-quantity ui-body-inherit" style="visibility:hidden">0</span></li>';

	return itemHTML;
}

function clearPreviewList() {
	var $panel = $('#order-preview-panel');
	if ($panel.is(":visible")) {
		$panel.hide();
	}

	$('#order-preview-list').empty();
}

function openQuickMenuDialog(type, itemID) {
	var menuItem = menuItems[itemID];
	var $dialog = $('#dialog-menu');
	$dialog.find('h1').text(menuItem.name);

	var $main = $dialog.children('[data-role="main"]');
	$main.children('div').hide();	// hide all children

	showQuickMenuContent(type);
	$dialog.popup('open');
	return;

	function showQuickMenuContent(type) {
		var $div = $main.children('#dialog-menu-' + type);

		if (type === 'detail') {
			$div.children('img').attr('src', menuItem.image);
			$div.children('p').text(menuItem.desc ? menuItem.desc : '');
			$div.find('a').off('click').click(function() {
				$div.hide();
				showQuickMenuContent('new');
				$dialog.popup("reposition", {});
			});
		} else if (type === 'new') {
			loadRequestInputEvents($div, itemID);
			loadQuantityInputEvents($div);

			$div.find('form').off('submit').submit(function(){
				var orderItem = createNewOrderItem(itemID);
				fetchOrderInputs(orderItem, $div);
				var orderItemHTML = generateOrderItemHTML(orderItem);
				$(orderItemHTML).insertBefore('#new-order');
				$('ul#order-list[data-role="listview"]').listview().listview("refresh");
				window.history.go(-2);
				$('#order-item-' + orderItem.id).fadeOut().fadeIn('slow').fadeOut().fadeIn('slow');
			});
		} else {
			throw 'Invalid menu dialog type: "' + type + "'";
		}
		
		$div.show();
	}
}
