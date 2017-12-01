function populateHome() {
	populateAddress();
	populateSearchForm();
}

function populateSearchForm() {
	var $form = $('#service-search-form');
	
	$form.off('submit').submit(function() {
		var $input = $form.find('[name="service-search"]');
		var text = $input.val();
		if (text && text.length > 0) {
			$.mobile.loading('show');
			search(text, function(results) {
				var $ul = $('#service-list');
				var html = generateServicesHTML(results);
				$ul.empty().append($(html)).listview().listview('refresh');
				$.mobile.loading('hide');
			});
		}
	});
}

function generateServicesHTML(services) {
	var html = '';

	// for each menu's groups
	for (var id in services) {
		var service = services[id];
		service.id = id;
		html += generateServiceHTML(service);
	}

	return html;
}

function generateServiceHTML(service) {
	var html = '<li id="service-item-' + service.id + '"><a href="javascript:navigateToService(\'' + service.id + '\');">';

	if (service.image) {
		html += '<img src="' + service.image + '" style="border-radius: 15%">';
	}

	if (service.name) {
		html += '<h2>' + service.name + '</h2>';
	}

	if (service.desc) {
		html += '<p>' + service.desc + '</p>';
	}

	if (service.status) {
		html += '<span class="ui-li-count">' + service.status + '</span>';
	}

	html += '</a></li>';

	return html;
}

function navigateToService(serviceID) {
	if ((typeof _ServiceID === 'undefined') || serviceID != _ServiceID) {
		$.mobile.loading('show');
		fetchServiceData(serviceID, function() {
			$.mobile.navigate('#order', {
				transition: "slidefade",
			});
			$.mobile.loading('hide');
		});
	} else {
		$.mobile.navigate('#order', {
			transition: "slidefade",
		});
	}
}

function fetchServiceData(serviceID, chain) {
	var dataChannel = _ably.channels.get('data');
	var client = generate_quick_guid();

	dataChannel.subscribe(client, function(message) {
		dataChannel.unsubscribe(client, arguments.callee);
		chain();
		messageHandler(message);
		populateService(serviceID);	
	});

	dataChannel.publish('fetch', {
		client: client,
		serviceID: serviceID,
		service: !_SERVICES[serviceID].hasOwnProperty('product'),
		customer: true,
	});
}

function populateService(serviceID) {
	loadServiceData(serviceID);
	populateOrder();
	populateMenu();
}

function search(text, onSuccess) {
	text = text.toUpperCase();
	var results = {};
	var properties = ['name', 'desc']

	for (var propID in properties) {
		var property = properties[propID];

		for (var serviceID in _SERVICES) {
			if (results.hasOwnProperty(serviceID)) {
				continue;
			}

			var service = _SERVICES[serviceID];
			var propValue = service[property].toUpperCase();

			if (propValue.indexOf(text) >= 0 ||
					removeDiacritics(propValue).indexOf(text) >= 0) {
				results[serviceID] = service;
			}
		}
	}

	if ($.isFunction(onSuccess)) {
		setTimeout(function() {
			onSuccess(results);
		}, 100 + Math.random() * 300);
	} else {
		return results;
	}
}

function location_load() {
	var locationJSON = local_load('location');
	return locationJSON ? JSON.parse(locationJSON) : {}
}

function location_save(location) {
	local_save('location', JSON.stringify(location));
}

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
				location.state = LocationState.REJECTED;
				location_save(location);
			});
			$dialog.find('#location-allow').off('click').click(function () {
				geoLocate();
			});
			$dialog.popup('open');
		});
	} else {
		geoLocate();
	}

	// TODO: save for a week and each part of the day
	if (location && location.address) {
		showLocation(location);
	}

	//initMapPicker();
	return; // only local function from here

	function geoLocate() {
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
			}, function (error) {
				switch (error.code) {
					case error.PERMISSION_DENIED:
						// Note: this case include both Block, and Close action by user
						console.warn('Geolocation is blocked.');
						// TODO: show "accidently blocked" message
						location.state = LocationState.BLOCKED;
						location_save(location);
						break;
					case error.POSITION_UNAVAILABLE:
						console.warn('Geolocation is unavailable.');
						break;
					case error.TIMEOUT:
						console.warn('Timout while getting geolocation.');
						break;
				}
			});
		} else {
			console.warn('Geolocation is not supported by this browser.');
			location.state = LocationState.UNSUPPORTED;
			location_save(location);
		}
	}

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
