$(document).ready(function(){
	initialize_local_storage();

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

	$("#delivery-tabs").tabs({
		activate: function(event, ui) {
			var activeTab = $(this).tabs("option", "active");

            if (activeTab == 0) {
                loadDeliveryTable();
            } else if (activeTab == 1) {
                
            } else if (activeTab == 2) {
                
            }

			// assume that the first tab "table" take the largest space
			// so no need for popup reposition on switching to other tab
			$('#dialog-delivery').popup("reposition", { positionTo: "#footer-button-delivery" });
		}
	});

	$('#dialog-delivery').one('popupbeforeposition', loadDeliveryTable);

	function loadDeliveryTable() {
		var $dialog = $('#dialog-delivery');
		var $main = $dialog.children('[data-role="main"]');

		$div = $main.children('div#delivery-tabs').children('div#tab-table');

		if ($div.children().length === 0) {
			$div.hide();
			var html = '';
			for (var i in deliveryData) {
				var floor = deliveryData[i];
				var floorHTML = '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">';
				floorHTML += '<legend>' + floor.name + '</legend>';

				for (var j = 0; j < floor.seats.length; ++j) {
					var seat = floor.seats[j];
					var seatName = 'seat-' + i + '-' + j;
					floorHTML += '<input type="checkbox" id="' + seatName + '">';
					floorHTML += '<label for="' + seatName + '">' + seat.displayName + '</label>'
				}

				floorHTML += '</fieldset>';

				html = floorHTML + html; // revert the floor order
			}

			$div.html(html).enhanceWithin();
			$div.show();
		}		
	}

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

	/* Geolocation */
	function initGeolocation() {
		if (navigator && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				console.log('Geolocation is allowed. Current location is ' + position.coords.latitude + ':' +position.coords.longitude);
			}, function() {
				console.error('Geolocation is blocked.');
			});
		} else {
			console.error('Geolocation is not supported');
		}
	}

	//initGeolocation();

	/*$("#menuFilterInput").bind("input", function(event, ui) {
		// on filter input change
	});*/
})
