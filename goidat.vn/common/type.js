/* Data Models */
OrderState = {
	QUEUEING: 	'queueing',
	PROCESSING:	'processing',
	SERVING:	'serving',
	FINISHED:	'finished',
	REJECTED:	'rejected',
}

function compareState(a, b) {
	return getStateOrder(a) - getStateOrder(b);

	function getStateOrder(state) {
		switch (state) {
			case OrderState.QUEUEING:	return 1;
			case OrderState.PROCESSING:	return 2;
			case OrderState.SERVING:	return 3;
			case OrderState.FINISHED:	return 3;
			case OrderState.REJECTED:	return 3;
			default:					return 3;
		}
	}
}

function compareRequest(a, b) {
	if (!a) {
		return -1;
	} else if (!b) {
		return 1;
	} else {
		if (a < b) {
			return -1;
		} else if (a > b) {
			return 1;
		} else {
			return 0;
		}
	}
}

function compareOrder(a, b) {
	var result = compareState(a.state, b.state);
	if (result != 0) {
		// revert sort the state
		return -result;
	}

	if (a.state == OrderState.PROCESSING) {
		if (a.item.name < b.item.name) {
			return -1;
		} else if (a.item.name > b.item.name) {
			return 1;
		} else {
			result = compareRequest(a.request, b.request);
			if (result != 0) {
				// revert sort the request
				return -result;
			}
		}
	} else if (a.state == OrderState.SERVING) {
		// TODO: sort by delivery
	}
	
	return a.created - b.created;
}
