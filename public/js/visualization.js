function Graph(data) {
    this.data = data || [];
    this.nodes = [];
    this.streams = [];
    this.tickets = [];
    this.loadData();
}

Graph.prototype.render = function() {
    if(this.nodes.length == 0) {
        return;
    }
    var colors = pv.Colors.category19();

    var vis = new pv.Panel()
        .width(900)
        .height(450)
        .fillStyle("white")
        .event("mousedown", pv.Behavior.pan())
        .event("mousewheel", pv.Behavior.zoom());

    var annotatedNodes = [];
    var nodeIndex = {};
    var annotatedStreams = [];
    var cleanedLinks = [];
    for(var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].type = "node"
        annotatedNodes.push(this.nodes[i])
        nodeIndex[this.nodes[i].id] = i;
    }

    for(var i = 0; i < this.nodes.length; i++) {
        if(this.nodes[i].primary_supernode_id) {
            cleanedLinks.push({source: i,
                target: nodeIndex[this.nodes[i].primary_supernode_id],
                value: 25});
        }
    }

    for(var i = 0; i < this.streams.length; i++) {
        this.streams[i].type = "stream"
        annotatedStreams.push(this.streams[i])
        cleanedLinks.push({source: this.nodes.length + i,
            target: nodeIndex[this.streams[i].source]});
    }

    var force = vis.add(pv.Layout.Force)
        .nodes([].concat(annotatedNodes, annotatedStreams))
        .links(cleanedLinks)
        .chargeConstant(-1000);

    force.link.add(pv.Line);

    force.node.add(pv.Dot)
        .size(function(d){
            var size = (d.linkDegree + 100) * Math.pow(this.scale, -1.5);
            if(d.supernode) {
                size += 50;
            } else if (d.type === "stream") {
                size -= 50;
            }
            return size;
        })
        .fillStyle(function(d){
            var style = d.fix ? "brown" : colors(d.id);
            if(d.supernode) {
                style = "red";
            } else if (d.type === "stream") {
                style = "green";
            }
            return style;
        })
        .strokeStyle(function(){ return this.fillStyle().darker()})
        .lineWidth(1)
        .title(function(d){ 
            if(d.type === "stream") {
                return "Stream: " + d.name;
            } else if(d.type === "node") {
                var result = "";
                if(d.supernode) {
                    result += "Supernode: ";
                } else {
                    result += "Node: ";
                }
                return result + d.ip_address + ":" + d.port;
            }
            return "None";
        })
        .event("mousedown", pv.Behavior.drag())
        .event("drag", force);

    vis.render();
}

Graph.prototype.loadData = function() {
    this.loadNodes();
    this.loadStreams();
}

Graph.prototype.loadNodes = function() {
    var g = this;
    $.ajax({
        url: "http://localhost:8000/nodes",
        success: function(data) {
            if(data.nodes && data.nodes.length > 0) {
                g.nodes = data.nodes;
            }
            //g.render();
        },
        dataType: 'jsonp'
    });
}

Graph.prototype.loadStreams = function() {
    var g = this;
    $.ajax({
        url: "http://localhost:8000/streams",
        success: function(data) {
            if(data.streams && data.streams.length > 0) {
                g.streams = data.streams;
            }
            g.streams = [{id: 42, name: "foo", source: 1}];
            g.render();
        },
        dataType: 'jsonp'
    });
}

$(window).load(function() {
    var graph = new Graph();
    graph.render();
});
