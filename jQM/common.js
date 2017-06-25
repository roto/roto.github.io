/*****************************************************************************/
/*                          Common Shared For All Pages                      */
/*****************************************************************************/

function getFilterText(text) {
	var normalizedText = removeDiacritics(text);
	if (normalizedText === text) {
		return text;
	}
	return text + '|' + normalizedText;
}

function switchTheme() {
	$("[data-role='page']").each(function (idx, page) {
		var $page = $(page);
		var clsToRemove;
		if ($page.attr("data-theme") === "b") {
			$page.attr("data-theme", "a");
			clsToRemove = /\b[\w-]+?-b\b/g;
		} else {
			$page.attr("data-theme", "b");
			clsToRemove = /\b[\w-]+?-a\b/g;
		}

		var cls = $page.attr("class");
		if (cls) {
			cls = cls.replace(clsToRemove, '');
			$page.attr("class", cls);
		}

		/* revert popup overlay style */
		$page.find('.ui-popup-screen').each(function (idx, overlay) {
			var $overlay = $(overlay);

			var cls = $overlay.attr('class');
			if (cls.indexOf('ui-overlay-b') >= 0) {
				$overlay.attr('class', cls.replace('ui-overlay-b', 'ui-overlay-a'));
			} else {
				$overlay.attr('class', cls.replace('ui-overlay-a', 'ui-overlay-b'));
			}
		});

		try {
			$page.page("destroy");
		} catch (err) {
			if (err.message.indexOf("prior to initialization") >= 0) {
				// page might not be initilized, ignore and continue
			} else {
				throw err;
			}
		}

		$page.page();
	});
}
