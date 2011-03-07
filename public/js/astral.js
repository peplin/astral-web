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
