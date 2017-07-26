function populateHome() {
	populateAddress();

	function populateAddress() {
		initGeolocation();

		var $pAddress = $('#p-address');
		var $hiddenInputAddress = $('#address');

		// TODO: save for a week and each part of the day
		var lastAddress = local_load('lastAddress');
		if (lastAddress) {
			setAddress(local_load('lastLatitute'), local_load('lastLongtitute'), lastAddress);
		}

		function setAddress(lat, lng, addr, located) {
			if ($hiddenInputAddress.val() !== addr) {
				$pAddress.fadeOut(function () {
					$pAddress.text('Near ' + addr).fadeIn('slow');
				});

				$hiddenInputAddress.val(addr);
			}

			$('#latitute').val(lat);
			$('#longtitute').val(lng);

			if (located) {
				// only save when located
				local_save('lastAddress', addr);
				local_save('lastLatitute', lat);
				local_save('lastLongtitute', lng);

				$('#locate').text('Somewhere else?');
			} else {
				$('#locate').text('Locating..');
			}
		}

		/* Geolocation */
		function initGeolocation() {
			if (navigator && navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					console.log('Geolocation is allowed. Current location is ' + position.coords.latitude + ' ' + position.coords.longitude);
					var latlng = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					var geocoder = new google.maps.Geocoder;
					geocoder.geocode({ 'location': latlng }, function (results, status) {
						if (status === 'OK') {
							var formatted_address = results[1].formatted_address;
							setAddress(latlng.lat, latlng.lng, formatted_address, true);
						} else {
							noLocation();
							console.warn('Geocoder failed due to: ' + status);
						}
					});
				}, function () {
					noLocation();
					console.warn('Geolocation is blocked.');
				});
			} else {
				noLocation();
				console.warn('Geolocation is not supported');
			}

			function noLocation() {
				if ($hiddenInputAddress.val()) {
					$('#locate').text('Not your location?');
				} else {
					$('#locate').text('Where are you?');
				}
			}
		}
	}
}

function initMap() {
	// Google Map is initialized
}