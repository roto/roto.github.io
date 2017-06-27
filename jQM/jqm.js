$(document).ready(function(){
	$(document).on('swiperight', function () {
		if ($.mobile.activePage.find('[data-role="popup"]').parent().hasClass("ui-popup-active")){
			// TODO: better process mouse drag select
			return false;
		}
		$.mobile.back();
	});

	$('#order').on('swipeleft', function () {
		if ($.mobile.activePage.find('[data-role="popup"]').parent().hasClass("ui-popup-active")){
			// TODO: better process mouse drag select
			return false;
		}
		$.mobile.changePage('#menu', {
			transition: "slidefade",
			changeHash: true,
		});
	});

	populateOrder();
	populateMenu();

	/* Geolocation */
	function initGeolocation() {
		if (navigator && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				console.log('Geolocation is allowed. Current location is ' + position.coords.latitude + ':' +position.coords.longitude);
			}, function() {
				console.error('Geolocation is blocked.');
			});
		} else {
			console.error('Geolocation is not supported');
		}
	}

	//initGeolocation();

	/*$("#menuFilterInput").bind("input", function(event, ui) {
		// on filter input change
	});*/
})
