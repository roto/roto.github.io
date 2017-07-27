function populateHome() {
	populateAddress();

	function populateAddress() {
		initGeolocation();

		var $pAddress = $('#p-address');
		var $hdnAddress = $('#address');
		var $linkLocate = $('#locate');

		// TODO: save for a week and each part of the day
		var lastAddress = local_load('lastAddress');
		if (lastAddress) {
			setAddress(local_load('lastlatitude'), local_load('lastlongitude'), lastAddress);
		}

		function setAddress(lat, lng, addr, located) {
			if ($hdnAddress.val() !== addr) {
				$pAddress.fadeOut(function () {
					$pAddress.text('Near ' + addr).fadeIn('slow');
				});

				$hdnAddress.val(addr);
			}

			$('#latitude').val(lat);
			$('#longitude').val(lng);

			if (located) {
				// only save when located
				local_save('lastAddress', addr);
				local_save('lastlatitude', lat);
				local_save('lastlongitude', lng);

				initMapPicker();
			} else {
				$linkLocate.text('Locating..');
			}
		}

		/* Geolocation */
		function initGeolocation() {
			if (navigator && navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					console.log('Geolocation is allowed. Current location is ' + position.coords.latitude + ' ' + position.coords.longitude);
					var latlng = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};
					var geocoder = new google.maps.Geocoder;
					geocoder.geocode({ 'location': latlng }, function (results, status) {
						if (status === 'OK') {
							var formatted_address = results[1].formatted_address;
							setAddress(latlng.lat, latlng.lng, formatted_address, true);
						} else {
							initMapPicker();
							console.warn('Geocoder failed due to: ' + status);
						}
					});
				}, function () {
					initMapPicker();
					console.warn('Geolocation is blocked.');
				});
			} else {
				initMapPicker();
				console.warn('Geolocation is not supported');
			}
		}

		function initMapPicker() {
			if ($hdnAddress.val()) {
				$linkLocate.text('Somewhere else?');
			} else {
				$linkLocate.text('Where are you?');
			}

			$linkLocate.off('click').click(function (event, ui) {
				var $map = $('#map');
				$map.hide();

				var $divPicker = $map.children('#picker');
				var w = $map.parent().width();
				$divPicker.width(w).height(w);

				var latitude = $('#latitude').val();
				var longitude = $('#longitude').val();

				if (latitude && longitude) {
					$divPicker.locationpicker({
						location: {
							latitude: Number(latitude),
							longitude: Number(longitude),
						},
						inputBinding: {
							radiusInput: $('#picker-radius'),
							locationNameInput: $('#picker-address')
						},
					});
				} else {
					$divPicker.locationpicker();
				}

				$map.fadeIn('slow');
			})
		}
	}
}

function initMap() {
	// Google Map is initialized
}