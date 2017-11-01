var ORDER_QUANTITY_POSTFIX = ' ×';

$(document).ready(function(){
	initialize_local_storage();

	populateHome();
	populateOrder();
	populateMenu();

	// not sure why, but this has to be done after menu is populated
	if (local_load('theme') === 'b') {
		switchTheme();
	}

	loadDeliveryPopup();
	
	disable_page_scroll_while_popup_shown();

	config_page_slide_for_touch_device(['order', 'menu']);

	/*$("#menuFilterInput").bind("input", function(event, ui) {
		// on filter input change
	});*/
})

$(window).load(function() {
	window.setTimeout(function() {
		// background loading jobs
		loadDeliveryTable();
	}, 100);
});
