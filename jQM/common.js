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
	$('[data-role="page"]').each(function (idx, page) {
		var $page = $(page);
		var theme = $page.attr('data-theme');
		var clsToRemove;
		if (theme === 'b') {
			$page.attr('data-theme', 'a');
			clsToRemove = /\b[\w-]+?-b\b/g;
		} else {
			$page.attr('data-theme', 'b');
			clsToRemove = /\b[\w-]+?-a\b/g;
		}

		var cls = $page.attr('class');
		if (cls) {
			cls = cls.replace(clsToRemove, '');
			$page.attr('class', cls);
		}

		/* revert popup overlay style */
		$page.find('[data-role="popup"]').each(function (idx, popup) {
			var $popup = $(popup);
			$popup.attr('data-overlay-theme', theme);

			try {
				$popup.popup('destroy');
			} catch (err) {
				if (err.message.indexOf('prior to initialization') >= 0) {
					// popup might not be initilized, ignore and continue
				} else {
					throw err;
				}
			}
		});

		try {
			$page.page('destroy');
		} catch (err) {
			if (err.message.indexOf('prior to initialization') >= 0) {
				// page might not be initilized, ignore and continue
			} else {
				throw err;
			}
		}

		$page.page();
	});
}
