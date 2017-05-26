$(document).ready(function(){
})

$(document).on("click", "ul li", function(event) {
    /*$(this).animate({
        opacity: 0,
        left: "+=50%"
    }, 300, "swing", function () {
        // Animation complete.
        $(this).remove();
    });*/
}).on("swipeleft", "ul li", function(e) {
    $(this).animate({
        left: "-=13%"
    }, 130, "swing", function () {

    });
}).on("swiperight", "ul li", function(e) {
    $(this).animate({
        left: "+=13%"
    }, 130, "swing", function () {

    });
});

function switchTheme() {
    var $pages = $("[data-role='page']");

    $pages.each(function (idx, page) {
        var $page = $(page);
        var clsToRemove;
        if ($page.attr("data-theme") === "b") {
            $page.attr("data-theme", "a");
            clsToRemove = /\b[\w-]+?-b\b/g;
        } else {
            $page.attr("data-theme", "b");
            clsToRemove = /\b[\w-]+?-a\b/g;
        }

        $page.each(function (idx, element) {
            var $element = $(element);
            var cls = $element.attr("class");
            if (cls) {
                cls = cls.replace(clsToRemove, '');
                $element.attr("class", cls);
            }
        });

        $page.page("destroy").page();
    });
}
