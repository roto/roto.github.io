$(document).ready(function(){
})

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

        try {
            $page.page("destroy");
        } catch (err) {
            if (err.message.indexOf("prior to initialization") >= 0) {
                // page might not be initilized, ignore and continue
            } else {
                throw err;
            }
        }

        $page.page();
    });
}
