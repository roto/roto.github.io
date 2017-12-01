/**
 * Constants
 */
var ALL_GROUP = '*';

/**
 * Initalize Ably message channel
 */
var _ably = new Ably.Realtime({
	key: 'agg3hg.T0Klpw:byN8TMRdKPVupvnk',
	echoMessages: false,
});

var _channel;

_ably.connection.on('connected', function() {

	if (VENDOR) {
		vendorDataSync();

		// subscribe to all service channels
		for (var id in _SERVICES) {
			with ({serviceID: id}) { // create a object to pass the id value to closure
				_ably.channels.get(serviceID).subscribe(function(message) {
					if (VENDOR && serviceID != _ServiceID) {
						// not active service, queue the message
						_CUSTOMERS[serviceID].pendingMessages.push(message);
					} else {
						messageHandler(message);
					}
				});
			}
		}

		initDataProvider();
	}

	/*if (VENDOR) {
		// vendor does not need the group id, and always subscribe to all topic
		// vendee need it, so it will subscribe right after the data is fully synced
		_channel.subscribe(messageHandler);
	} else {
		// all group message
		_channel.subscribe(ALL_GROUP, messageHandler);
	}*/
});

function messageHandler(message) {
	if (message.data.script) {
		eval(message.data.script);
	}
}

function vendorDataSync() {
	var synChannel = _ably.channels.get('sync');

	synChannel.subscribe('sync', function(message) {
		var data = {
			script:
"_SERVICES = message.data.services;\
_CUSTOMERS = message.data.customers;\
populateHome();",
			services: _SERVICES,
			customers: _CUSTOMERS,
		};

		synChannel.publish(message.data.client, data);
	});

	var client = generate_quick_guid();

	synChannel.publish('sync', {
		client: client,
	});

	synChannel.subscribe(client, syncHandler);

	// auto unsubscribe after 13s
	setTimeout(function() {
		synChannel.unsubscribe(client, syncHandler);
	}, 13 * 1000);

	function syncHandler(message) {
		synChannel.unsubscribe(client, syncHandler);

		// sync all global data
		if (message.data.script) {
			eval(message.data.script);
		}
	}
}

function initDataProvider() {
	var dataChannel = _ably.channels.get('data');

	dataChannel.subscribe('fetch', function(message) {
		var serviceID = message.data.serviceID;

		var data = {
			script: "",
		}

		if (message.data.service) {
			data.script += "Object.assign(_SERVICES, message.data.service);";
			data.service = { [serviceID] : _SERVICES[serviceID] };
		}

		if (message.data.customer) {
			data.script += "Object.assign(_CUSTOMERS, message.data.customer);";
			data.customer = { [serviceID] : _CUSTOMERS[serviceID] };
		}

		if (data.script.length > 0) {
			dataChannel.publish(message.data.client, data);
		}
	});
}
