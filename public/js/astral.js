var ASTRAL = {}

// sets up the Astral flash streaming module and instructs it to upload to and
// preview from the local RTMP server type is "webcam"/"file"
function previewStream(stream_id, type) {
    $.ajax({
        url: "http://localhost:8000/settings",
        success: function(data) {
            ASTRAL.astral_streaming_module.setupAndStream(ASTRAL.userRole,
                stream_id,
                type,
                "rtmp://localhost:" + data.rtmp_port + "/"
                    + data.rtmp_resource);
        },
        dataType: 'jsonp'
    });
}

// tells the Python node to set up the HTTP tunnel on localhost and advertise
// the stream on the network (port forwarding to the RTMP server for each
// remote connection) probably want to pass all the attributes of the stream
function publishStream(stream_slug) {
    alert("TO DO: tell node to start publishing, aka. advertise the stream with uuid [" + stream_slug + "] on the network");
}

// if userRole == publisher: tells the Python node to stop publishing
// if userRole == consumer: tells flash to stop displying
function stopStream() {
    ASTRAL.astral_streaming_module.stopStreaming();
    if (ASTRAL.userRole == "publisher") {
        alert("TODO: tell node to stop publishing, aka. stop advertising uuid [" + streamSlug + "] on the network");
    }
}

// sets up the Astral flash streaming module and instructs it to connect to a
// specific port on localhost, an HTTP tunnel to a remote RTMP server
function consumeStream(stream_id) {
    $.ajax({
        url: "http://localhost:8000/settings",
        success: function(data) {
            ASTRAL.astral_streaming_module.setupAndStream(ASTRAL.userRole,
                stream_id, "", "",
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

        // automatically start consuming if the role is "consumer"
        if (ASTRAL.userRole == "consumer") {
            $("#streaming_notice").text("Streaming from network.");
            $("#consume_stop").removeClass("hidden");
            consumeStream(streamSlug);
        } else {
            $("#streaming_notice").text(
                    "Please select a streaming source to preview:");
            $("#preview_webcam").removeClass("hidden");
            $("#preview_file").removeClass("hidden");
        }

        // add click handlers for the streaming controls
        $("#preview_webcam").click(function(e) {
            e.preventDefault();
            $("#preview_webcam").addClass("hidden");
            $("#preview_file").addClass("hidden");
            $("#publish_start").removeClass("hidden");
            $("#streaming_notice").text("(This is a preview, you need to " + 
                    "click on Publish to start uploading.)");
            previewStream(streamSlug, "");
        });

        $("#preview_file").click(function(e) {
            e.preventDefault();
            $("#preview_webcam").addClass("hidden");
            $("#preview_file").addClass("hidden");
            $("#publish_start").removeClass("hidden");
            $("#streaming_notice").text("(This is a preview, you need to " +
                    "click on Publish to start uploading.)");
            previewStream(streamSlug,
                    "http://localhost:8000/upload_stream_file");
        });

        $("#publish_start").click(function(e) {
            e.preventDefault();
            $("#publish_start").addClass("hidden");
            $("#publish_stop").removeClass("hidden");
            $("#streaming_notice").text("(Video is streaming to the network.)");
            publishStream(streamSlug);
        });

        $("#publish_stop").click(function(e) {
            e.preventDefault();
            $("#publish_stop").addClass("hidden");
            $("#streaming_notice").text(
                    "Stopped publishing. Please reload page.");
            stopStream();
        });

        $("#consume_stop").click(function(e) {
            e.preventDefault();
            $("#consume_stop").addClass("hidden");
            $("#streaming_notice").text(
                    "Stopped streaming. Please reload page.");
            stopStream();
        });
    }
});
