var LocationState = {
	REJECTED: 'rejected',
	BLOCKED: 'blocked',
	ACCEPTED: 'accepted',
	UNSUPPORTED: 'unsupported',
}

function populateHome() {
	populateAddress();

	function populateAddress() {
		var $pAddress = $('#p-address');
		var $hdnAddress = $('#address');
		var $linkLocate = $('#locate');

		// get the local saved location
		var location = location_load();

		if (!location.state || location.state === LocationState.REJECTED) {
			// location is never asked before or rejected
			$linkLocate.text('Use my location');
			$linkLocate.off('click').click(function (event, ui) {
				var $dialog = $('#dialog-location');
				$dialog.find('#location-reject').off('click').click(function () {
					//alert('reject');
				});
				$dialog.find('#location-allow').off('click').click(function () {
					//alert('accept');
				});
				$dialog.popup('open');
			});
		} else {
			if (navigator && navigator.geolocation) {
				/* Geolocation */
				navigator.geolocation.getCurrentPosition(function (position) {
					// update the location on GPS located
					console.log('Geolocation is allowed. Current location is ' + position.coords.latitude + ' ' + position.coords.longitude);

					// update the location variable, without saving to local storage
					location = {
						state: LocationState.ACCEPTED,
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};

					var latlng = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};
					var geocoder = new google.maps.Geocoder;
					geocoder.geocode({ 'location': latlng }, function (results, status) {
						if (status === 'OK') {
							location.address = results[1].formatted_address;
							showLocation(location);
						} else {
							console.warn('Geocoder failed due to: ' + status);
						}
						location_save(location);
					});
				}, function () {
					console.warn('Geolocation is blocked.');
					location = {
						state: LocationState.BLOCKED,
					}
					location_save(location);
				});
			} else {
				console.warn('Geolocation is not supported');
				location = {
					state: LocationState.UNSUPPORTED,
				}
				location_save(location);
			}
		}

		// TODO: save for a week and each part of the day
		if (location && location.address) {
			showLocation(location);
		}

		//initMapPicker();
		return; // only local function from here

		function showLocation(location) {
			if ($hdnAddress.val() !== location.address) {
				$pAddress.fadeOut(function () {
					$pAddress.text('Near ' + location.address).fadeIn('slow');
				});

				$hdnAddress.val(location.address);
			}

			$('#latitude').val(location.lat);
			$('#longitude').val(location.lng);
		}

		/*function fetchLocation(location) {
			location.lat = $('#latitude').val();
			location.lng = $('#longitude').val();
			location.address = $hdnAddress.val();
		}*/

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

function location_save(location) {
	local_save('location', JSON.stringify(location));
}
