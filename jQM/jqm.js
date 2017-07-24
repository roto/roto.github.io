$(document).ready(function(){
	initialize_local_storage();

	populateHome();
	populateOrder();
	populateMenu();

	// not sure why, but this has to be done after menu is populated
	if (local_load('theme') === 'b') {
		switchTheme();
	}

	// disable page scroll while popup is shown
	$(document).on('popupafteropen', '[data-role="popup"]', function(event, ui) {
		$('body').css('overflow', 'hidden').on('touchmove', function(e) {
			e.preventDefault();
		});
	}).on('popupafterclose', '[data-role="popup"]', function(event, ui) {
		$('body').css('overflow', 'auto').off('touchmove');
	});

	loadDeliveryPopup();

	if (is_touch_device()) {
		$(document).on('swiperight', function () {
			$.mobile.back();
		});

		$('#order').on('swipeleft', function () {
			$.mobile.changePage('#menu', {
				transition: "slidefade",
				changeHash: true,
			});
		});

		// change swipe speed sensitivity
		$.event.special.swipe.durationThreshold = 750;
	}

	/*$("#menuFilterInput").bind("input", function(event, ui) {
		// on filter input change
	});*/
})

$(window).load(function() {
	window.setTimeout(function() {
		// background loading jobs
		loadDeliveryTable();
	}, 100);
});
