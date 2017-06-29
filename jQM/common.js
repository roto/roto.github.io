/*****************************************************************************/
/*                          Common Shared For All Pages                      */
/*****************************************************************************/

/* Find the duplicate order */
function isRequestOrdered(itemID, request, excludeOrderItemID) {
	for (var i in orderItems) {
		if (excludeOrderItemID === i) {
			continue;
		}

		var orderItem = orderItems[i];
		if (orderItem.item.id === itemID) {
			if (!request && !orderItem.request) {
				return true;
			}

			if (request && orderItem.request ) {
				if (request.trim().toLowerCase() === orderItem.request.trim().toLowerCase()) {
					return true;
				}
			}
		}
	}

	return false;
}

function loadRequestInputEvents($div, itemID, orderItemID) {
	var $requestInput = $div.find('input[name="request"]');
	$requestInput.off("input");
	var $dupWarn = $div.find('#warn-duplicate');

	// there are orders of the same item, monitor the input event
	$requestInput.on("input", function() {
		if (isRequestOrdered(itemID, $requestInput.val(), orderItemID)) {
			// identical order exists, show warning
			$dupWarn.show();
		} else {
			$dupWarn.hide();
		}
	});

	if (orderItemID && orderItems[orderItemID] && orderItems[orderItemID].request) {
		$requestInput.val(orderItems[orderItemID].request).trigger("input");
	} else {
		$requestInput.val('').trigger("input");
	}
}

function loadQuantityInputEvents($div, quantity) {
	var $quantityRangeInput = $div.find('input[name="quantity"]');
	$quantityRangeInput.val(quantity ? quantity : 1);

	function resetRangeSlider() {
		$quantityRangeInput.attr("max", 10);
		$quantityRangeInput.slider("refresh");
		$div.find('div[role="application"]').show();
	}

	$quantityRangeInput.off("focus").on("focus", function() {
		$quantityRangeInput.removeAttr("max");
	});

	$quantityRangeInput.off("blur").on("blur", function() {
		if ($quantityRangeInput.val() > 10) {
			$div.find('div[role="application"]').hide();
		} else {
			resetRangeSlider();
		}
	});

	resetRangeSlider();
}

function fetchOrderInputs(orderItem, $div) {
	var quantity = $div.find('input[name="quantity"]').val();
	if (quantity && quantity > 1) {
		orderItem.quantity = quantity;
	} else {
		delete orderItem.quantity;
	}

	var request = $div.find('input[name="request"]').val().trim();
	if (request && request.length > 0) {
		orderItem.request = request;
	} else {
		delete orderItem.request;
	}

	return orderItem;
}

function getFilterText(text) {
	var normalizedText = removeDiacritics(text);
	if (normalizedText === text) {
		return text;
	}
	return text + '|' + normalizedText;
}

function switchTheme() {
	$('[data-role="page"]').each(function (idx, page) {
		var $page = $(page);
		var theme = $page.attr('data-theme');
		var clsToRemove;
		if (theme === 'b') {
			$page.attr('data-theme', 'a');
			clsToRemove = /\b[\w-]+?-b\b/g;
		} else {
			$page.attr('data-theme', 'b');
			clsToRemove = /\b[\w-]+?-a\b/g;
		}

		var cls = $page.attr('class');
		if (cls) {
			cls = cls.replace(clsToRemove, '');
			$page.attr('class', cls);
		}

		/* revert popup overlay style */
		$page.find('[data-role="popup"]').each(function (idx, popup) {
			var $popup = $(popup);
			$popup.attr('data-overlay-theme', theme);

			try {
				$popup.popup('destroy');
			} catch (err) {
				if (err.message.indexOf('prior to initialization') >= 0) {
					// popup might not be initilized, ignore and continue
				} else {
					throw err;
				}
			}
		});

		try {
			$page.page('destroy');
		} catch (err) {
			if (err.message.indexOf('prior to initialization') >= 0) {
				// page might not be initilized, ignore and continue
			} else {
				throw err;
			}
		}

		$page.page();
	});
}
