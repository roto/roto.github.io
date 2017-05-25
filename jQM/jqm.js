$(document).ready(function(){
})

function ss() {
    var $page = $("#page");
    if ($page.attr("data-theme") === "a") {
        $page.attr("data-theme", "b");
    } else {
        $page.attr("data-theme", "a");
    }

    $page.page("destroy").page();
}
