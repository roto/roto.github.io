function populateHome() {
	//initGeolocation();

    /* Geolocation */
    function initGeolocation() {
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                console.log('Geolocation is allowed. Current location is ' + position.coords.latitude + ' ' + position.coords.longitude);
            }, function () {
                console.error('Geolocation is blocked.');
            });
        } else {
            console.error('Geolocation is not supported');
        }
    }
}