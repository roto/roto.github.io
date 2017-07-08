
function onDeliveryPopupOpen(event, ui) {
    // highlight the current tab
    $('#dialog-delivery .ui-tabs-active > a').addClass('ui-btn-active');
}

function onDeliveryTabActivate(event, ui) {
    var $activeTab = $(this).tabs("option", "active");

    if ($activeTab == 0) {	// table
        loadDeliveryTable();
    } else if ($activeTab == 1) {	// booking
        
    } else if ($activeTab == 2) {	// shipping
        
    }
}

function loadDeliveryTable() {
    var $dialog = $('#dialog-delivery');
    var $main = $dialog.children('[data-role="main"]');

    $div = $main.children('div#delivery-tabs').children('div#tab-table');

    if ($div.children().length === 0) {
        $div.hide();
        var html = '';
        for (var i in deliveryData) {
            var floor = deliveryData[i];
            var floorHTML = '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">';
            floorHTML += '<legend>' + floor.name + '</legend>';

            for (var j = 0; j < floor.seats.length; ++j) {
                var seat = floor.seats[j];
                var seatName = 'seat-' + i + '-' + j;
                floorHTML += '<input type="checkbox" id="' + seatName + '">';
                floorHTML += '<label for="' + seatName + '">' + seat.displayName + '</label>'
            }

            floorHTML += '</fieldset>';

            html = floorHTML + html; // revert the floor order
        }

        $div.html(html).enhanceWithin();
        $div.show();
    }		
}
