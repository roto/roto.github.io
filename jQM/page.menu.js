
function populateMenu() {
	var groupsHTML = '';

	// for each menu's groups
	for (var idx = 0; idx < menuGroups.length; ++idx) {
		var group = menuGroups[idx];
		if (typeof group === 'undefined' || typeof group.items === 'undefined' || group.items.length === 0) {
			// group.items is not defined or empty
			continue;
		}

		groupsHTML += generateMenuGroupHTML(group);
	}

	// append the collapsible group div
	$('ul#menu-list[data-role="listview"]').empty().append($(groupsHTML)).listview().listview("refresh");
}

function menuDialogDetail(itemID) {
	var menuItem = menuItems[itemID];
	var $dialog = $("#menu-detail-dialog");
	var $main = $dialog.children('[data-role="main"]');

	$dialog.find('h1').text(menuItem.name);
	$main.children('img').attr('src', menuItem.image);
	$main.children('p').text(menuItem.desc ? menuItem.desc : '');

	$main.find('a').off('click').on('click', function() {
		$dialog.on('popupafterclose', function() {
			if(navigator.userAgent.match('CriOS')) {
				window.history.pushState(null, "MENU", "#menu");
			}
			menuDialogNewOrder(itemID);
		});
		$.mobile.back();
	});

	$dialog.off('popupafterclose');
	$dialog.popup('open');
}

function menuDialogNewOrder(itemID) {
	var $dialog = $("#menu-new-order-dialog");
	$dialog.find('h1[role="heading"]').text(menuItems[itemID].name);

	loadRequestInputEvents($dialog, itemID);
	loadQuantityInputEvents($dialog);

	$dialog.find("form#new-order-form").off("submit").submit(function(){
		var orderItem = createNewOrderItem(itemID);
		fetchOrderInputs(orderItem, $dialog);
		var orderItemHTML = generateOrderItemHTML(orderItem);
		$(orderItemHTML).insertBefore('#new-order');
		$('ul#order-list[data-role="listview"]').listview().listview("refresh");
		window.history.go(-2);
		$('#order-item-' + orderItem.id).fadeOut('slow').fadeIn('slow').fadeOut('slow').fadeIn('slow');
	});

	$dialog.popup("open");
}

function generateMenuGroupHTML(group) {
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

		generateMenuItemFilterText(item, !group.nofilter);
		itemsHTML += generateMenuItemHTML(item);
		groupFilterText += item.filterText;
	}

	// nested items UL
	groupHTML += '<ul data-role="listview" data-inset="true">' + itemsHTML + '</ul>';

	// generate the collapsible group div with data-filtertext
	var groupHTMLPrefix = '<div data-role="collapsible" data-collapsed="false" id="group-' + group.id + '"';
	if (groupFilterText.length > 0) {
		groupHTMLPrefix += ' data-filtertext="' + groupFilterText + '"';
	}
	groupHTML = groupHTMLPrefix + '>' + groupHTML + '</div>';

	return groupHTML;
}

function generateMenuItemFilterText(item, allowFilter) {
	if (typeof item.filterText !== 'undefined' && item.filterText.length > 0) {
		// filter text is already generated, return
		return;
	}

	item.filterText = "";

	if (!allowFilter) {
		return;
	}

	if (item.name) {
		item.filterText += '|' + getFilterText(item.name);
	}

	if (item.desc) {
		item.filterText += '|' + getFilterText(item.desc);
	}
}

function generateMenuItemHTML(item) {
	var itemHTML = '<a href="javascript:menuDialogDetail(\'' + item.id + '\')">';

	if (item.image) {
		itemHTML += '<img style="border-radius: 50%" src="' + item.image + '">';
	}

	if (item.name) {
		itemHTML += '<h2>' + item.name + '</h2>';
	}

	if (item.desc) {
		itemHTML += '<p>' + item.desc + '</p>';
	}

	if (item.price) {
		itemHTML += '<span class="ui-li-count">' + formatPrice(item.price) + '</span>';
	}

	itemHTML += '</a><a href="javascript:menuDialogNewOrder(\'' + item.id + '\');" class="ui-btn ui-icon-plus">Order</a></li>';

	if (item.filterText.length > 0) {
		itemHTML = '<li id="item-' + item.id + '" data-filtertext="' + item.filterText + '">' + itemHTML;
	} else {
		itemHTML = '<li id="item-' + item.id + '">' + itemHTML;
	}

	return itemHTML;
}
