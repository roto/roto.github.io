
/**
 * Initalize Ably message channel
 */
var _ably = new Ably.Realtime('agg3hg.T0Klpw:byN8TMRdKPVupvnk');
var _channel;

_ably.connection.on('connected', function() {
    _channel = _ably.channels.get('Huế');

    if (VENDOR) {
        _channel.subscribe(function(message) {
            var groupID = message.name;
            // TODO
        })
    } else if (VENDEE) {
        _channel.subscribe(_GroupID, function(message) {
            // TODO
        })
    }
        
    if (VENDOR) {
        // sync: {groupID}
        _channel.subscribe('sync', function(message) {
            var client = message.data.client;
            var groupID = message.data.group;

            _channel.publish(client, {
                orderGroups: _OrderGroups,
                deliveryData: _DeliveryData,
            });
        });
    } else if (VENDEE) {
        var client = generate_quick_guid();

        _channel.subscribe(client, function(message) {
            _channel.unsubscribe(client, arguments.callee);

            // sync all global data
            _OrderGroups = message.data.orderGroups;
            _DeliveryData = message.data.deliveryData;
            _GroupID = Object.keys(_OrderGroups)[1];
            _GroupOrders = _OrderGroups[_GroupID].orders;

            populateGroupData();
        });

        _channel.publish('sync', {
            client: client,
            group: _GroupID, // currently ignored due to client/server desync
        });
    }
});
