
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

function menuShowDetail(itemID) {
	var menuItem = menuItems[itemID];
	var $dialog = $("#menuDetailDialog");
	var $main = $dialog.children('[data-role="main"]');

	$dialog.find('h1').text(menuItem.name);
	$main.children('img').attr('src', menuItem.image);
	$main.children('p').text(menuItem.desc ? menuItem.desc : '');

	$main.find('a').off('click').on('click', function() {
		$dialog.on('popupafterclose', function() {
			setTimeout(function() {
				menuNewOrder(itemID);
			}, 0);
		});
		$dialog.popup('close');
	});

	$dialog.off('popupafterclose');
	$dialog.popup('open');
}

function menuNewOrder(itemID) {
	var $dialog = $("#menuNewOrderDialog");

	$dialog.find('h1[role="heading"]').text(menuItems[itemID].name);

	/* Request */
	// pre-compose the request values of the same item ordered.
	var orderedRequests = '|';
	for (var i in orderItems) {
		var orderItem = orderItems[i];
		if (orderItem.item.id === itemID) {
			if (orderItem.request) {
				orderedRequests += orderItem.request.trim().toLowerCase();
			}
			orderedRequests += '|';
		}
	}

	var $requestInput = $dialog.find('input[name="request"]');
	$requestInput.off("input");
	var $dupWarn = $dialog.find('#warn-duplicate');
	$dupWarn.hide();
	if (orderedRequests.length > 1) {
		// there are orders of the same item, monitor the input event
		$requestInput.on("input", function() {
			if (0 <= orderedRequests.indexOf('|' + $requestInput.val().trim().toLowerCase() + '|')) {
				// identical order exists, show warning
				$dupWarn.show();
			} else {
				$dupWarn.hide();
			}
		});
	}
	$requestInput.val('').trigger("input");

	/* Quantity */
	var $quantityRangeInput = $dialog.find('input[name="quantity"]');
	$quantityRangeInput.val('1');

	function resetRangeSlider() {
		$quantityRangeInput.attr("max", 10);
		$quantityRangeInput.slider("refresh");
		$dialog.find('div[role="application"]').show();
	}

	$quantityRangeInput.off("focus").on("focus", function() {
		$quantityRangeInput.removeAttr("max");
	});

	$quantityRangeInput.off("blur").on("blur", function() {
		if ($quantityRangeInput.val() > 10) {
			$dialog.find('div[role="application"]').hide();
		} else {
			resetRangeSlider();
		}
	});
	/* End of Quantity */

	$dialog.find("form#new-order-form").off("submit").submit(function(){
		// TODO: check duplicated itemID in orderItems
		// TODO: support item request
		var orderItem = createNewOrderItem(itemID);

		var quantity = $quantityRangeInput.val();
		if (quantity && quantity > 1) {
			orderItem.quantity = quantity;
		}

		var request = $requestInput.val().trim();
		if (request && request.length > 0) {
			orderItem.request = request;
		}

		var orderItemHTML = generateOrderItemHTML(orderItem);

		$(orderItemHTML).insertBefore('#new-order');
		$('ul#order-list[data-role="listview"]').listview().listview("refresh");
		window.history.go(-2);
		$('#order-item-' + orderItem.id).fadeOut('slow').fadeIn('slow').fadeOut('slow').fadeIn('slow');
	});

	resetRangeSlider();
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
	var itemHTML = '<a href="javascript:menuShowDetail(\'' + item.id + '\')">';

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

	itemHTML += '</a><a href="javascript:menuNewOrder(\'' + item.id + '\');" class="ui-btn ui-icon-plus">Order</a></li>';

	if (item.filterText.length > 0) {
		itemHTML = '<li id="item-' + item.id + '" data-filtertext="' + item.filterText + '">' + itemHTML;
	} else {
		itemHTML = '<li id="item-' + item.id + '">' + itemHTML;
	}

	return itemHTML;
}