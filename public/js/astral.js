var ASTRAL = {}

// sets up the Astral flash streaming module and instructs it to upload to and
function previewStream(streamSlug) {
    $.ajax({
        url: "http://localhost:8000/settings",
        success: function(data) {
            ASTRAL.astral_streaming_module.setupAndStream(ASTRAL.userRole,
                streamSlug,
                "rtmp://localhost:" + data.rtmp_port + "/"
                    + data.rtmp_resource);
        },
        dataType: 'jsonp'
    });
}

// tells the Python node to set up the HTTP tunnel on localhost and advertise
// the stream on the network (port forwarding to the RTMP server for each
// remote connection) probably want to pass all the attributes of the stream
function publishStream(streamSlug) {
    $.ajax({
        url: "http://localhost:8000/streams",
        data: {},
        success: function(data) {
        },
        error: function(xhr, status, error) {
        },
        dataType: 'json'
    });
    alert("TODO: tell node to start publishing, aka. advertise the stream with uuid [" + streamSlug + "] on the network");
}

function stopStream() {
    ASTRAL.astral_streaming_module.stopStreaming();
    // TODO if currently publish (check ASTRAL.publishing), inform node
    // TODO if consuming, tell node and stop flash
    alert("TODO: tell node to stop publishing, aka. " +
            "stop advertising uuid [" + streamSlug + "] on the network");
}

// sets up the Astral flash streaming module and instructs it to connect to a
// specific port on localhost, an HTTP tunnel to a remote RTMP server
function consumeStream(streamSlug) {
    $.ajax({
        url: "http://localhost:8000/settings",
        success: function(data) {
            ASTRAL.astral_streaming_module.setupAndStream(ASTRAL.userRole,
                streamSlug, "", "",
                "rtmp://localhost:" + data.rtmp_tunnel_port + "/"
                    + data.rtmp_resource);
        },
        dataType: 'jsonp'
    });
}

// used by flash to signal to the back-end to start playing a local flv
function startPublishingLocalFile(file_path) {
    alert("TODO: tell the node to start streaming the local file to the localhost RTMP server: " + file_path);
}

// used by flash to display error messages
function displayFromFlash(msg) {
    $("div#streaming_flash_error").text(msg);
}

// initialization
$(document).ready(function() {
    //load fonts
    WebFont.load({
        custom: {
            families: ['star-lit-night'],
            urls: ['/css/font.css']
        }
    });

    ASTRAL.astral_streaming_module = $("#astral");
    // Either publisher or consumer
    ASTRAL.userRole = "publisher";

    if (ASTRAL.astral_streaming_module) {
        // get the stream's unique identifier on the network
        streamSlug = $("div#slug").text();

        $("#consume_start").removeClass("hidden");
        $("#publish_start").removeClass("hidden");

        $("#publish_start").click(function(e) {
            e.preventDefault();
            $("#publish_start").addClass("hidden");
            $("#publish_resume").removeClass("hidden");
            $("#publish_stop").removeClass("hidden");
            previewStream(streamSlug);

            publishStream(streamSlug);

            $("#streaming_notice").text("(This is a preview - the video " +
                "will not be streaming until you click \"Start Streaming\"");
        });

        $("#publish_resume").click(function(e) {
            $("#publish_pause").removeClass("hidden");
            $("#publish_resume").addClass("hidden");
            $("#streaming_notice").text("(Video is streaming to the network.)");
            // TODO actually resume it
        });

        $("#publish_pause").click(function(e) {
            $("#publish_resume").removeClass("hidden");
            $("#publish_pause").addClass("hidden");
            $("#streaming_notice").text("(Streaming is now paused.");
            // TODO actually pause it
        });

        $("#publish_stop").click(function(e) {
            e.preventDefault();
            $("#consume_start").removeClass("hidden");
            $("#publish_stop").addClass("hidden");
            $("#publish_pause").addClass("hidden");
            $("#publish_resume").addClass("hidden");
            $("#streaming_notice").text(
                    "Stopped publishing. Please reload page.");
            stopStream();
        });

        $("#consume_stop").click(function(e) {
            e.preventDefault();
            $("#consume_start").removeClass("hidden");
            $("#consume_stop").addClass("hidden");
            $("#streaming_notice").text("Stopped streaming.");
            stopStream();
        });

        $("#consume_start").click(function(e) {
            $("#streaming_notice").text("Streaming from network.");
            $("#consume_start").addClass("hidden");
            $("#consume_stop").removeClass("hidden");
            consumeStream(streamSlug);
        });
    }
});
