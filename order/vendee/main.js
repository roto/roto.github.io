var VENDEE = true;
var VENDOR = false;
var ORDER_QUANTITY_POSTFIX = ' ×';

$(document).ready(function(){
	initialize_local_storage();

	populateHome();
	
	disable_page_scroll_while_popup_shown();
	
	config_page_slide_for_touch_device(['order', 'menu']);
		
	if (local_load('theme') === 'b') {
		switchTheme();
	}
})

function populateGroupData() {
	populateOrder();
	populateMenu();
}
