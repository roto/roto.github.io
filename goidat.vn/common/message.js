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
    syncThemAll();

    _channel = _ably.channels.get('Huế');

    if (VENDOR) {
        // vendor does not need the group id, and always subscribe to all topic
        // vendee need it, so it will subscribe right after the data is fully synced
        _channel.subscribe(messageHandler);
    } else {
        // all group message
        _channel.subscribe(ALL_GROUP, messageHandler);
    }
});

function messageHandler(message) {
    if (message.data.script) {
        eval(message.data.script);
    }
}

function syncThemAll() {
    var synChannel = _ably.channels.get('sync');
    
    if (VENDOR) {
        // sync: {groupID}
        synChannel.subscribe('sync', function(message) {
            var client = message.data.client;
            var groupID = message.data.group;

            synChannel.publish(client, {
                script:
"_OrderGroups = message.data.orderGroups;\
_AllOrders = message.data.allOrders;\
_DeliveryData = message.data.deliveryData;\
_GroupID = Object.keys(_OrderGroups)[1];\
_GroupOrders = _OrderGroups[_GroupID].orders;\
populateGroupData();",
                orderGroups: _OrderGroups,
                deliveryData: _DeliveryData,
                allOrders: _AllOrders,
            });
        });
    }

    var client = generate_quick_guid();

    synChannel.publish('sync', {
        client: client,
        group: _GroupID, // currently ignored due to client/server desync
    });

    synChannel.subscribe(client, syncHandler);

    // auto unsubscribe after 13s
    setTimeout(function() {
        synChannel.unsubscribe(client, syncHandler);
    }, 30 * 1000);

    function syncHandler(message) {
        synChannel.unsubscribe(client, syncHandler);

        // sync all global data
        if (message.data.script) {
            eval(message.data.script);
        }

        if (VENDEE) {
            // vendee need correct group id
            // vendor does not need it, and always subscribe to all in the caller function
            _channel.subscribe(_GroupID, messageHandler);
        }
    }
}
