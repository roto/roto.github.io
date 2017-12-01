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

function messageHandler(message) {
	if (message.data.script) {
		eval(message.data.script);
	}
}
