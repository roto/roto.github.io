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

	$('#dialog-delivery').on('popupbeforeposition', function(event, ui) {
		var $dialog = $('#dialog-delivery');
		var $main = $dialog.children('[data-role="main"]');

		if ($main.children('div').children('div[name="content"]').children().length === 0) {
			$main.children('div').hide();	// hide all children
			showDeliveryContent('table');
		}
		return;

		function showDeliveryContent(type) {
			var $div = $main.children('#dialog-delivery-' + type).hide();
			var $content = $div.children('div[name="content"]');

			if (type === 'table') {
				if ($content.children().length === 0) {
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
					
					$content.html(html).enhanceWithin();
				}

				$div.show();
			} else if (type === 'book') {

			} else if (type === 'ship') {

			}
		}
	});

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
