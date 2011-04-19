var astral_streaming_module;	// the DOM object of the Astral flash streaming module
var role = "publisher";			// the user's role: "publisher"/"consumer"
var stream_network_uid;			// the stream's unique identifier on the network
var local_rtmp_server_address = "rtmp://localhost:1935/astral";	// fetched from the Python back-end
var local_http_tunnel_address = "rtmp://localhost:5000/astral";	// fetched from the Python back-end


// sets up the Astral flash streaming module and instructs it to upload to and preview from the local RTMP server  
// file_location is an empty string if the user streams the webcam
// local_rtmp_server_address is of the form "rtmp://IP:Port/resource_name"
function previewStream(stream_id, file_location) {
	astral_streaming_module.setupAndStream(role, stream_id, file_location, local_rtmp_server_address, "");
}

// tells the Python node to set up the HTTP tunnel on localhost and advertise the stream on the network (port forwarding to the RTMP server for each remote connection)
// probably want to pass all the attributes of the stream
function publishStream(stream_id) {
	astral_streaming_module.setupAndStartStreaming("", "", "", "");
}

// sets up the Astral flash streaming module and instructs it to connect to a specific port on localhost, an HTTP tunnel to a remote RTMP server
// local_http_tunnel_address is of the form "rtmp://IP:Port/resource_name"
function consumeStream(stream_id) {
	astral_streaming_module.setupAndStartStreaming(role, stream_id, "", "", local_http_tunnel_address);
}

// used by flash to display error messages
function displayFromFlash(msg) {
	$("div#streaming_flash_error").text(msg);
}

// initialization
$(document).ready(function() {
	// fetch the Astral streaming module, if available
	astral_streaming_module = document.getElementById("astral");
	
	if (astral_streaming_module != null) {
		// get the stream's unique identifier on the network
		stream_network_uid = $("div#stream_network_uid").text();
		// automatically start consuming if the role is "consumer"
		if (role == "consumer") {
			consumeStream(stream_id);
		} else {
			$("#streaming_notice").text("Please select a streaming source:");
		}
		// add click handlers for the streaming controls
		$("#stream_preview_webcam").click(function(e) {
			e.preventDefault();
			$("#stream_preview_webcam").addClass("hidden");
			$("#stream_preview_file").addClass("hidden");
			$("#stream_publish_start").removeClass("hidden");
			$("#streaming_notice").text("(This is a preview, you need to click on Publish to start uploading.)");
			previewStream(stream_network_uid, "");
		});
		$("#stream_preview_file").click(function(e) {
			e.preventDefault();
			alert("will be working shortly");
			//previewStream(stream_network_uid, "file_location");
		});
		$("#stream_publish_start").click(function(e) {
			e.preventDefault();
			$("#stream_publish_start").addClass("hidden");
			$("#stream_publish_stop").removeClass("hidden");
			$("#streaming_notice").text("(Video is streaming to the network.)");
			//publishStream(stream_network_uid);
		});
		$("#stream_publish_stop").click(function(e) {
			e.preventDefault();
			$("#stream_publish_stop").addClass("hidden");
			$("#streaming_notice").text("Stopped. Please reload page.");
			//stopStream();
		});
		$("#stream_consume_stop").click(function(e) {
			e.preventDefault();
			stopStream();
		});
	}
});




WebFont.load({
    custom: {
        families: ['star-lit-night'],
        urls: ['/css/font.css']
    }
});

jwplayer("player").setup({
    players: [
        {type: "flash", src: "/swf/vendor/player.swf"},
        {type: "html5"}
    ],
    file: "/video.mp4",
    height: 270,
    width: 480
});

