$(document).ready(function(){
})

function switchTheme() {
    var $page = $("#page");
    var clsToRemove;
    if ($page.attr("data-theme") === "a") {
        $page.attr("data-theme", "b");
        clsToRemove = /\b[\w-]+?-a\b/g;
    } else {
        $page.attr("data-theme", "a");
        clsToRemove = /\b[\w-]+?-b\b/g;
    }

    $page.each(function(idx, element) {
        var $element = $(element);
        var cls = $element.attr("class");
        cls = cls.replace(clsToRemove, '');
        $element.attr("class", cls);
    });

    $page.page("destroy").page();
}
