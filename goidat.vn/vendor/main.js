$(document).ready(function(){
	initialize_local_storage();

	populateHome();
	populateOrder();
	populateDelivery();

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
