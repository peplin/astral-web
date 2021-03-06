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
            ASTRAL.streaming_url = "rtmp://localhost:" + data.rtmp_port + "/" + data.rtmp_resource;
            $("div#streaming_url").html("app: " + ASTRAL.streaming_url + "&nbsp;&nbsp;&nbsp; media path: " + streamSlug)
        },
        dataType: 'jsonp'
    });
}

function changeStreamStatus(streamSlug, streamingStatus) {
    $.ajax({
        type: "PUT",
        data: JSON.stringify({"streaming": streamingStatus}),
        url: "http://localhost:8000/stream/" + streamSlug,
        dataType: 'json'
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
        async: false
    });

    setTimeout("openStreamTunnel(\"" + streamSlug + "\", true)", 1000);
}

function openStreamTunnel(streamSlug, doRetries) {
    $.ajax({
        url: "http://localhost:8000/stream/" + streamSlug + "/ticket",
        success: function(ticketData) {
            if (!ticketData.ticket.destination_port) {
                // keep calling this until the tunnel is actually opened and we
                // can read the port
                if(doRetries === true) {
                    setTimeout("openStreamTunnel(\"" + streamSlug + "\", true)",
                        1000);
                }
            } else {
                $.ajax({
                    url: "http://localhost:8000/settings",
                    success: function(settings) {
                        ASTRAL.astral_streaming_module.setupAndStream(
                            ASTRAL.userRole,
                            streamSlug,
                            "",
                            "",
                            "rtmp://localhost:"
                                + ticketData.ticket.destination_port
                                + "/" + settings.rtmp_resource);
                        ASTRAL.streaming_url = "rtmp://localhost:" + ticketData.ticket.destination_port + "/" + settings.rtmp_resource;
                        $("div#streaming_url").html("app: " + ASTRAL.streaming_url + "&nbsp;&nbsp;&nbsp; media path: " + streamSlug);
                    },
                    dataType: 'jsonp'
                });
                displayCurrentlyConsumingControls();
            }
        },
        dataType: "jsonp"
    });
}

function stopConsuming(streamSlug) {
    ASTRAL.astral_streaming_module.stopStreaming();
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


function displayCurrentlyConsumingControls() {
    $("#streaming_notice").text("Streaming from network.");
    $("#consume_start").addClass("hidden");
    $("#consume_stop").removeClass("hidden");
}


//ping the node process to make sure it's available (will throw JS error if it's not)
function pingNode() {
    $.ajax({
        url: "http://localhost:8000/ping",
        success: function(data) {
            var d = new Date();
            ASTRAL.last_ping_reply = d.getTime();
            d = null;
        },
        dataType: 'jsonp'
    });
}

// check the last ping reply and display an error if the background process isn't there anymore
function checkLastPingReply() {
    var d = new Date();
    if (d.getTime() - ASTRAL.last_ping_reply > ASTRAL.max_ping_age) {
        if ($("div#error_notice").hasClass("hidden")) {
            $("div#error_notice").removeClass("hidden");
        }
        $("div#error_notice").text("Background process is down, please restart!");
    }
    else {
        if (!$("div#error_notice").hasClass("hidden")) {
            $("div#error_notice").addClass("hidden");
        }
        $("div#error_notice").text("");
    }
    d = null;
}


$(document).ready(function() {
    WebFont.load({
        custom: {
            families: ['star-lit-night'],
            urls: ['/css/font.css']
        }
    });

    // ping the background process periodically show notification based of the age of the last valid reply
    ASTRAL.last_ping_reply = 0;
    ASTRAL.max_ping_age = 4*1000;
    pingNode();     // get an initial read at startup
    timer_ping_node = setInterval("pingNode()", 3*1000);
    timer_check_last_ping_reply = setInterval("checkLastPingReply()", 1*1000);
    
    // check if the flash player is embedded
    ASTRAL.astral_streaming_module = document.getElementById("astral");
    // Either publisher or consumer
    ASTRAL.userRole = $("#publish_start").length != 0 ?
            "publisher" : "consumer";
    if (ASTRAL.astral_streaming_module) {
        // get the stream's unique identifier on the network
        var streamSlug = $("div#slug").text();
        if(streamSlug) {
            if(ASTRAL.userRole === "publisher") {
                previewStream(streamSlug);
                $("#streaming_notice").text("This is a preview - the video " +
                    "will not be streaming until you start publishing.");
            } else {
                // check if we have an existing ticket for this stream and
                // tunnel already going
                openStreamTunnel(streamSlug);
            }
        }

        $("#consume_start").removeClass("hidden");
        $("#publish_start").removeClass("hidden");
        $("#publish_stop").removeClass("hidden");

        $("#publish_start").click(function(e) {
            e.preventDefault();
            $("#publish_pause").removeClass("hidden");
            $("#publish_start").addClass("hidden");
            $("#streaming_notice").text("Video is streaming to the network.");

            changeStreamStatus(streamSlug, true);
            return false;
        });

        $("#publish_pause").click(function(e) {
            e.preventDefault();
            $("#publish_start").removeClass("hidden");
            $("#publish_pause").addClass("hidden");
            $("#streaming_notice").text("Streaming is now paused.");
            changeStreamStatus(streamSlug, false);
            return false;
        });

        $("#publish_stop").click(function(e) {
            e.preventDefault();
            $("#consume_start").removeClass("hidden");
            $("#publish_stop").addClass("hidden");
            $("#publish_pause").addClass("hidden");
            $("#publish_start").addClass("hidden");
            $("#streaming_notice").text(
                    "Stopped publishing. Please reload page.");
            $("div#streaming_url").html("&nbsp;");
            stopStream();
            return false;
        });

        $("#consume_stop").click(function(e) {
            e.preventDefault();
            $("#consume_start").removeClass("hidden");
            $("#consume_stop").addClass("hidden");
            $("#streaming_notice").text("Stopped streaming.");
            $("div#streaming_url").html("&nbsp;");
            stopConsuming(streamSlug);
            return false;
        });

        $("#consume_start").click(function(e) {
            e.preventDefault();
            $("#streaming_notice").text("Loading stream...");
            startConsuming(streamSlug);
            return false;
        });
    }
});
