$(document).ready(function(){
	initialize_local_storage();

	populateHome();
	populateOrder();

	// not sure why, but this has to be done after menu is populated
	if (local_load('theme') === 'b') {
		switchTheme();
	}

	$('.initial').each(function() {
		initial($(this));
	});

	disable_page_scroll_while_popup_shown();

	config_page_slide_for_touch_device(['order', 'menu']);
})

function initial($img) {
	var charCount = $img.attr('data-name').length;
	var foneSize = Math.min(100, ($img.width() * 2) / charCount);
	$img.initial({
		charCount: charCount,
		fontSize: foneSize,
		fontWeight: 700,
	});
}
