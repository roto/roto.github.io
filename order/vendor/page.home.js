function populateHome() {
	var html = '';
	
	// for all orders
	for (var serviceID in _SERVICES) {
		html += generateServiceItemHTML(serviceID);
	}

	$('ul#service-list[data-role="listview"]').empty().append($(html)).listview().listview("refresh")
			.find('.initial.uninitialized').removeClass('uninitialized').each(function() {
				initial($(this));
			});
}

function generateServiceItemHTML(serviceID) {
	var service = _SERVICES[serviceID];
	var html = '<li id="service-item-' + serviceID + '"><a href="javascript:navigateToService(\'' + serviceID + '\');">';

	if (service.initial) {
		html += '<img data-name="' + service.initial + '" class="initial uninitialized" style="border-radius: 15%">';
	}

	if (service.alias) {
		html += '<h2>' + service.alias + '</h2>';
	}

	if (service.desc) {
		html += '<p>' + service.desc + '</p>';
	}

	if (service.status) {
		html += '<span class="ui-li-count">' + service.status + '</span>';
	}

	return html;
}

function navigateToService(serviceID) {
	$.mobile.navigate('#queue', {
		transition: "slidefade",
	});

	loadServiceData(serviceID);
	populateService();

	// replay all the pending messages while the service is inative
	while (_CUSTOMERS[serviceID].pendingMessages.length > 0) {
		messageHandler(_CUSTOMERS[serviceID].pendingMessages.shift());
	}
}
