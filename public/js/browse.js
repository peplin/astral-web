$(document).ready(function() {
    // update stream links on page with correct /publisher URL if the source_uuid is the node.uuid
    $.ajax({
        url: "http://localhost:8000/node",
        success: function(data) {
            $('div.hidden.source_uuid').each(function(index) {
                if ($(this).text() == data.node.uuid) {
                    $(this).parent().attr('href', function(i, href) { return href + '/publish' });
                }
            });
        },
        dataType: 'jsonp'
    });
});