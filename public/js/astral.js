var astral_streaming_module;	// the DOM object of the Astral flash streaming module
var role = "publisher";			// the user's role: "publisher"/"consumer"
var stream_slug;				// the stream's unique identifier on the network
var file_upload_script_url = "http://localhost:4567/upload_stream_file";	// URL of the file uploader script (files need to be placed next to the swf in order to be accessed for streaming) 
var local_rtmp_server_address = "rtmp://localhost:1935/astral";	// fetched from the Python back-end
var local_http_tunnel_address = "rtmp://localhost:5000/astral";	// fetched from the Python back-end


// sets up the Astral flash streaming module and instructs it to upload to and preview from the local RTMP server  
// type is "webcam"/"file"
// local_rtmp_server_address is of the form "rtmp://IP:Port/resource_name"
function previewStream(stream_id, type) {
	astral_streaming_module.setupAndStream(role, stream_id, type, local_rtmp_server_address, "");
}

// tells the Python node to set up the HTTP tunnel on localhost and advertise the stream on the network (port forwarding to the RTMP server for each remote connection)
// probably want to pass all the attributes of the stream
function publishStream(stream_slug) {
	alert("TO DO: tell node to start publishing, aka. advertise the stream with uuid [" + stream_slug + "] on the network");
}

// if role == publisher: tells the Python node to stop publishing
// if role == consumer: tells flash to stop displying
function stopStream() {
	astral_streaming_module.stopStreaming();
	if (role == "publisher") {
		alert("TO DO: tell node to stop publishing, aka. stop advertising uuid [" + stream_slug + "] on the network");
	}
}

// sets up the Astral flash streaming module and instructs it to connect to a specific port on localhost, an HTTP tunnel to a remote RTMP server
// local_http_tunnel_address is of the form "rtmp://IP:Port/resource_name"
function consumeStream(stream_id) {
	astral_streaming_module.setupAndStream(role, stream_id, "", "", local_http_tunnel_address);
}

// used by flash to signal to the back-end to start playing a local flv
function startPublishingLocalFile(file_path) {
	alert("TO DO: tell the node to start streaming the local file to the localhost RTMP server: " + file_path);
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

	// fetch the Astral streaming module, if available
	astral_streaming_module = document.getElementById("astral");
	
	if (astral_streaming_module != null) {
		// get the stream's unique identifier on the network
		stream_slug = $("div#stream_slug").text();
		// automatically start consuming if the role is "consumer"
		if (role == "consumer") {
			$("#streaming_notice").text("Streaming from network.");
			$("#stream_consume_stop").removeClass("hidden");
			consumeStream(stream_slug);
		} else {
			$("#streaming_notice").text("Please select a streaming source to preview:");
			$("#stream_preview_webcam").removeClass("hidden");
			$("#stream_preview_file").removeClass("hidden");
		}
		// add click handlers for the streaming controls
		$("#stream_preview_webcam").click(function(e) {
			e.preventDefault();
			$("#stream_preview_webcam").addClass("hidden");
			$("#stream_preview_file").addClass("hidden");
			$("#stream_publish_start").removeClass("hidden");
			$("#streaming_notice").text("(This is a preview, you need to click on Publish to start uploading.)");
			previewStream(stream_slug, "");
		});
		$("#stream_preview_file").click(function(e) {
			e.preventDefault();
			$("#stream_preview_webcam").addClass("hidden");
			$("#stream_preview_file").addClass("hidden");
			$("#stream_publish_start").removeClass("hidden");
			$("#streaming_notice").text("(This is a preview, you need to click on Publish to start uploading.)");
			previewStream(stream_slug, file_upload_script_url);
		});
		$("#stream_publish_start").click(function(e) {
			e.preventDefault();
			$("#stream_publish_start").addClass("hidden");
			$("#stream_publish_stop").removeClass("hidden");
			$("#streaming_notice").text("(Video is streaming to the network.)");
			publishStream(stream_slug);
		});
		$("#stream_publish_stop").click(function(e) {
			e.preventDefault();
			$("#stream_publish_stop").addClass("hidden");
			$("#streaming_notice").text("Stopped publishing. Please reload page.");
			stopStream();
		});
		$("#stream_consume_stop").click(function(e) {
			e.preventDefault();
			$("#stream_consume_stop").addClass("hidden");
			$("#streaming_notice").text("Stopped streaming. Please reload page.");
			stopStream();
		});
	}
});


