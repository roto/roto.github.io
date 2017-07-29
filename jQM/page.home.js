function populateHome() {
	populateAddress();

	function populateAddress() {
		var $pAddress = $('#p-address');
		var $hdnAddress = $('#address');
		var $linkLocate = $('#locate');

		var location = initGeolocation(function(position) {
			console.log('Geolocation is allowed. Current location is ' + position.coords.latitude + ' ' + position.coords.longitude);
			var location = {
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};
			var geocoder = new google.maps.Geocoder;
			geocoder.geocode({ 'location': location }, function (results, status) {
				if (status === 'OK') {
					location.address = results[1].formatted_address;
					setAddress(location, true);
				} else {
					console.warn('Geocoder failed due to: ' + status);
				}
			});
		});

		// TODO: save for a week and each part of the day
		if (location && location.address) {
			setAddress(location);
		}

		initMapPicker();
		return; // only local function from here

		function setAddress(location, located) {
			if ($hdnAddress.val() !== location.address) {
				$pAddress.fadeOut(function () {
					$pAddress.text('Near ' + location.address).fadeIn('slow');
				});

				$hdnAddress.val(location.address);
			}

			$('#latitude').val(location.lat);
			$('#longitude').val(location.lng);

			if (located) {
				// only save when located
				location_save(location);
			}
		}

		/* Geolocation */
		function initGeolocation(callback_located) {
			var location = location_load();

			if (location.used) {
				if (navigator && navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(callback_located, function () {
						console.warn('Geolocation is blocked.');
					});
				} else {
					console.warn('Geolocation is not supported');
				}
			}

			return location;
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

function location_load() {
	var locationJSON = local_load('location');
	return locationJSON ? JSON.parse(locationJSON) : {}
}

function location_save(location, used, lat, lng, address) {
	if (used) { location.used = used; }
	if (lat) { location.lat = lat; }
	if (lng) { location.lng = lng; }
	if (address) { location.address = address; }

	if (location) {
		local_save('location', JSON.stringify(location));
	}
}
