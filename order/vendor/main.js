var VENDEE = false;
var VENDOR = true;
var ORDER_QUANTITY_POSTFIX = '';

$(document).ready(function(){
	initialize_local_storage();

	populateHome();
	
	// not sure why, but this has to be done after menu is populated
	if (local_load('theme') === 'b') {
		switchTheme();
	}
	
	$('.initial.uninitialized').removeClass('uninitialized').each(function() {
		initial($(this));
	});
	
	disable_page_scroll_while_popup_shown();

	config_page_slide_for_touch_device(['order', 'menu']);
})

function populateService() {
	populateQueue();
	populateQuickMenu();
}

function populateGroupData() {
	populateDelivery();

	if ($.mobile.activePage && $.mobile.activePage.attr('id') == 'order') {
		populateOrder(_GroupID);
	}
}
