/*****************************************************************************/
/*                          Common Shared For All Pages                      */
/*****************************************************************************/

/* Find the duplicate order */
function isRequestOrdered(itemID, request, excludeOrderID) {
	for (var i in _GroupOrders) {
		if (excludeOrderID === i) {
			continue;
		}

		var order = _GroupOrders[i];
		if (order.item.id === itemID) {
			if (!request && !order.request) {
				return true;
			}

			if (request && order.request ) {
				if (request.trim().toLowerCase() === order.request.trim().toLowerCase()) {
					return true;
				}
			}
		}
	}

	return false;
}

function loadRequestInputEvents($div, itemID, orderID) {
	var $requestInput = $div.find('input[name="request"]');
	$requestInput.off("input");
	var $dupWarn = $div.find('#warn-duplicate');

	// there are orders of the same item, monitor the input event
	$requestInput.on("input", function() {
		if (isRequestOrdered(itemID, $requestInput.val(), orderID)) {
			// identical order exists, show warning
			$dupWarn.show();
		} else {
			$dupWarn.hide();
		}
	});

	if (orderID && _GroupOrders[orderID] && _GroupOrders[orderID].request) {
		$requestInput.val(_GroupOrders[orderID].request).trigger("input");
	} else {
		$requestInput.val('').trigger("input");
	}
}

function loadQuantityInputEvents($div, quantity) {
	var $quantityRangeInput = $div.find('input[name="quantity"]');
	var $slider = $div.find('div[role="application"]');
	updateRangeSlider(quantity ? quantity : 1);

	$quantityRangeInput.off("focus").on("focus", function() {
		$quantityRangeInput.removeAttr("max");
	});

	$quantityRangeInput.off("blur").on("blur", updateRangeSlider);

	function updateRangeSlider(quantity) {
		if (quantity && !isNaN(quantity)) {
			if (quantity > 10) {
				$quantityRangeInput.removeAttr("max");
			}
			$quantityRangeInput.val(quantity);
		}

		if ($quantityRangeInput.val() > 10) {
			$slider.hide();
		} else {
			$quantityRangeInput.attr("max", 10);
			$quantityRangeInput.slider("refresh");
			$slider.show();
		}
	}
}

function loadStateInput($div, state) {
	var $stateChain = $div.find('[name="state-chain"]');
	$stateChain.find('input[value="' + state + '"]').prop('checked', true);
	$stateChain.enhanceWithin();
}

/**
 * return map of only changed properties
 */
function fetchOrderInputs($div) {
	var order = {};

	var quantity = $div.find('input[name="quantity"]').val();
	if (quantity && quantity > 1) {
		order.quantity = quantity;
	}

	var request = $div.find('input[name="request"]').val().trim();
	if (request && request.length > 0) {
		order.request = request;
	}

	var state = $div.find('input[name="state"]:checked').val();
	if (state) {
		order.state = state;
	}

	return order;
}

function getFilterText(text) {
	var normalizedText = removeDiacritics(text);
	if (normalizedText === text) {
		return text;
	}
	return text + '|' + normalizedText;
}

function switchTheme() {
	var theme = $('#home').attr('data-theme');
	var newTheme = theme === 'b' ? 'a' : 'b';
	var clsToRemove = theme === 'b' ? /\b[\w-]+?-b\b/g : /\b[\w-]+?-a\b/g;

	$('[data-role="page"]').each(function (idx, page) {
		var $page = $(page);
		$page.attr('data-theme', newTheme);

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

	local_save('theme', newTheme);
}
