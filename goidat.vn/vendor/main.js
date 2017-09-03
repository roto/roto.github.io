$(document).ready(function(){
	initialize_local_storage();

	populateHome();
	populateOrder();

	// not sure why, but this has to be done after menu is populated
	if (local_load('theme') === 'b') {
		switchTheme();
	}

	// TODO: scale the fontSize base on data-name length
	$('.initial').initial({
		charCount: 4,
		fontSize: 35,
	});

	disable_page_scroll_while_popup_shown();

	config_page_slide_for_touch_device(['order', 'menu']);
})
