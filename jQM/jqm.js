$(document).ready(function(){
	$(document).on('swiperight', function () {
		$.mobile.back();
	});

	$('#order').on('swipeleft', function () {
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
