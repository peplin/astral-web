function getNodes() {
    $.ajax({
        url: "http://localhost:8000/nodes",
        success: function(data) {
            if(data.nodes && data.nodes.length > 0) {
                createGraph(data.nodes);
            }
        },
        dataType: 'jsonp'
    });
}

function createGraph(data) {
    if(!data || data.length == 0) {
        return;
    }
    var colors = pv.Colors.category19();

    var vis = new pv.Panel()
        .width(900)
        .height(450)
        .fillStyle("white")
        .event("mousedown", pv.Behavior.pan())
        .event("mousewheel", pv.Behavior.zoom());

    var force = vis.add(pv.Layout.Force)
        .nodes(data)
        .links([{source:1, target:0, value:1}])
        .chargeConstant(-10000);

    force.link.add(pv.Line);

    force.node.add(pv.Dot)
        .size(function(d){
            var size = (d.linkDegree + 100) * Math.pow(this.scale, -1.5);
            if(d.supernode) {
                size += 50;
            }
            return size;
        })
        .fillStyle(function(d){
            var style = d.fix ? "brown" : colors(d.uuid);
            if(d.supernode) {
                style = "red";
            }
            return style;
        })
        .strokeStyle(function(){ return this.fillStyle().darker()})
        .lineWidth(1)
        .title(function(d){ return d.ip_address + ":" + d.port; })
        .event("mousedown", pv.Behavior.drag())
        .event("drag", force);

    vis.render();
}

$(window).load(function() {
    getNodes();
});
