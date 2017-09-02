/*****************************************************************************/
/*                             Common Utilities                              */
/*****************************************************************************/

/* Local Storage */
function initialize_local_storage() {
	if (!has_local_storage) {
		// browser not support storage
		local_load = local_remove = local_save = $.noop;
	}

	function has_local_storage() {
		var mod = 'RotO';
		try {
			localStorage.setItem(mod, mod);
			localStorage.removeItem(mod);
			return true;
		} catch(e) {
			return false;
		}
	}
}

function local_save(key, value) {
	localStorage.setItem(key, value);
}

function local_load(key) {
	return localStorage.getItem(key);
}

function local_remove(key) {
	localStorage.removeItem(key);
}

/*****************************************************************************/

function is_touch_device() {
	return 'ontouchstart' in window				// for most browsers 
			|| !!(navigator.maxTouchPoints);	// for IE10/11 and Surface
};

function formatPrice(price) {
	if (price % 1000000000 == 0) {
		return addThousandSeparators(price / 1000000000) + "b";
	} else if (price % 1000000 == 0) {
		return addThousandSeparators(price / 1000000) + "m";
	} else if (price % 1000 == 0) {
		return addThousandSeparators(price / 1000) + "k";
	} else {
		return addThousandSeparators(price);
	}
}

/* Separator constants */
var DECIMAL_SEPARATOR = 0.1.toLocaleString().charAt(1);
var THOUSAND_SEPARATOR = DECIMAL_SEPARATOR === "." ? "," : ".";
var THOUSAND_REGEX = /(\d+)(\d{3})/;

/* http://www.mredkj.com/javascript/nfbasic.html */
function addThousandSeparators(number)
{
	var absNum = Math.abs(number);
	if (absNum < 1000) {
		return number;
	}
	var parts = absNum.toString().split(DECIMAL_SEPARATOR);
	var intPart = parts[0];
	var fracPart = parts.length > 1 ? DECIMAL_SEPARATOR + parts[1] : '';
	while (THOUSAND_REGEX.test(intPart)) {
		intPart = intPart.replace(THOUSAND_REGEX, '$1' + THOUSAND_SEPARATOR + '$2');
	}
	return (number < 0 ? "-" : "") + intPart + fracPart;
}
