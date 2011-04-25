var ASTRAL = {}

// sets up the Astral flash streaming module and instructs it to upload to and
function previewStream(streamSlug) {
    $.ajax({
        url: "http://localhost:8000/settings",
        success: function(data) {
            ASTRAL.astral_streaming_module.setupAndStream(
                ASTRAL.userRole,
                streamSlug,
                "",
                "rtmp://localhost:" + data.rtmp_port + "/"
                    + data.rtmp_resource,
                "");
        },
        dataType: 'jsonp'
    });
}

function changeStreamStatus(streamSlug, streamingStatus) {
    $.ajax({
        url: "http://localhost:8000/stream/" + streamSlug + "?streaming="
                + streamingStatus,
        dataType: 'jsonp'
    });
}

function stopStream() {
    ASTRAL.astral_streaming_module.stopStreaming();
    $.ajax({
        type: "DELETE",
        url: "http://localhost:8000/stream/" + streamSlug,
        dataType: 'jsonp'
    });
}

// sets up the Astral flash streaming module and instructs it to connect to a
// specific port on localhost, an HTTP tunnel to a remote RTMP server
function startConsuming(streamSlug) {
    $.ajax({
        type: "POST",
        url: "http://localhost:8000/stream/" + streamSlug + "/tickets",
        success: function(data) {
            $.ajax({
                url: "http://localhost:8000/settings",
                success: function(data) {
                    ASTRAL.astral_streaming_module.setupAndStream(
                        ASTRAL.userRole,
                        streamSlug,
                        "",
                        "",
                        "rtmp://localhost:" + data.rtmp_tunnel_port + "/"
                            + data.rtmp_resource);
                },
                dataType: 'jsonp'
            });
        }
    });
}

function stopConsuming(streamSlug) {
    $.ajax({
        type: "DELETE",
        url: "http://localhost:8000/stream/" + streamSlug + "/ticket",
        dataType: 'jsonp'
    });
}

// used by flash to display error messages
function displayFromFlash(msg) {
    $("div#streaming_flash_error").text(msg);
}

$(document).ready(function() {
    WebFont.load({
        custom: {
            families: ['star-lit-night'],
            urls: ['/css/font.css']
        }
    });

    ASTRAL.astral_streaming_module = document.getElementById("astral");
    // Either publisher or consumer
    ASTRAL.userRole = $("#publish_start").length != 0 ? 
            "publisher" : "consumer";
    if (ASTRAL.astral_streaming_module) {
        // get the stream's unique identifier on the network
        var streamSlug = $("div#slug").text();
        if(streamSlug && ASTRAL.userRole === "publisher") {
            previewStream(streamSlug);
            $("#streaming_notice").text("This is a preview - the video " +
                "will not be streaming until you being publishing.");
        }

        $("#consume_start").removeClass("hidden");
        $("#publish_start").removeClass("hidden");
        $("#publish_stop").removeClass("hidden");

        $("#publish_start").click(function(e) {
            $("#publish_pause").removeClass("hidden");
            $("#publish_start").addClass("hidden");
            $("#streaming_notice").text("Video is streaming to the network.");

            changeStreamStatus(streamSlug, true);
            return false;
        });

        $("#publish_pause").click(function(e) {
            $("#publish_start").removeClass("hidden");
            $("#publish_pause").addClass("hidden");
            $("#streaming_notice").text("Streaming is now paused.");
            changeStreamStatus(streamSlug, false);
            return false;
        });

        $("#publish_stop").click(function(e) {
            $("#consume_start").removeClass("hidden");
            $("#publish_stop").addClass("hidden");
            $("#publish_pause").addClass("hidden");
            $("#publish_start").addClass("hidden");
            $("#streaming_notice").text(
                    "Stopped publishing. Please reload page.");
            stopStream();
            return false;
        });

        $("#consume_stop").click(function(e) {
            $("#consume_start").removeClass("hidden");
            $("#consume_stop").addClass("hidden");
            $("#streaming_notice").text("Stopped streaming.");
            stopConsuming(streamSlug);
            return false;
        });

        $("#consume_start").click(function(e) {
            $("#streaming_notice").text("Streaming from network.");
            $("#consume_start").addClass("hidden");
            $("#consume_stop").removeClass("hidden");
            startConsuming(streamSlug);
            return false;
        });
    }
});
