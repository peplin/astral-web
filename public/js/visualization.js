var ASTRAL = {}

function Graph(data) {
    this.data = data || [];
    this.nodes = [];
    this.streams = [];
    this.tickets = [];

    this.force = undefined;

    this.panel = new pv.Panel()
        .canvas("visualization")
        .height(450)
        .fillStyle("white")
        .event("mousedown", pv.Behavior.pan())
        .event("mousewheel", pv.Behavior.zoom());

    this.force = this.panel.add(pv.Layout.Force)
        .springLength(150)
        .chargeConstant(-100);

    this.force.link.add(pv.Line);
    var colors = pv.Colors.category19();
    this.force.node.add(pv.Dot)
        .size(function(d){
            var offset = 100;
            if(d.supernode) {
                offset += 50;
            } else if (d.type === "stream") {
                offset -= 50;
            }
            return (d.linkDegree + offset) * Math.pow(this.scale, -1.5);
        })
        .fillStyle(function(d){
            var style = d.fix ? "brown" : colors(d.uuid);
            if(d.supernode) {
                style = "red";
            } else if (d.type === "stream") {
                style = "yellow";
            }
            return style;
        })
        .strokeStyle(function(){ return this.fillStyle().darker()})
        .lineWidth(1)
        .title(this.nodeLabel)
        .event("mousedown", pv.Behavior.drag())
        .event("drag", this.force);

    this.force.label.add(pv.Label)
        .text(this.nodeLabel);
}

Graph.prototype.draw = function() {
    this.loadData();
    this.render();
}

Graph.prototype.render = function() {
    if(this.nodes.length == 0) {
        return;
    }

    var annotatedNodes = [];
    var nodeIndex = {};
    var annotatedStreams = [];
    var cleanedLinks = [];
    for(var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].type = "node"
        annotatedNodes.push(this.nodes[i])
        nodeIndex[this.nodes[i].uuid] = i;
    }

    for(var i = 0; i < this.nodes.length; i++) {
        if(this.nodes[i].primary_supernode_uuid) {
            cleanedLinks.push({source: i,
                target: nodeIndex[this.nodes[i].primary_supernode_uuid],
                value: 25});
        }
    }

    for(var i = 0; i < this.streams.length; i++) {
        this.streams[i].type = "stream"
        annotatedStreams.push(this.streams[i])
        cleanedLinks.push({source: this.nodes.length + i,
            target: nodeIndex[this.streams[i].source]});
    }

    for(var i = 0; i < this.tickets.length; i++) {
        cleanedLinks.push({source: nodeIndex[this.tickets[i].source],
            target: nodeIndex[this.tickets[i].destination]});
    }

    this.force.nodes([].concat(annotatedNodes, annotatedStreams))
    this.force.links(cleanedLinks)

    this.force.reset();
    this.panel.render();
}

Graph.prototype.nodeLabel = function(node) {
    if(node.type === "stream") {
        return "Stream: " + node.name;
    } else if(node.type === "node") {
        var result = "";
        if(node.supernode) {
            result += "Supernode: ";
        } else {
            result += "Node: ";
        }
        return result + node.ip_address + ":" + node.port;
    }
    return "None";
}

Graph.prototype.loadData = function() {
    this.loadNodes();
    this.loadStreams();
    this.loadTickets();
}

Graph.prototype.loadNodes = function() {
    var that = this;
    $.ajax({
        url: "http://localhost:8000/nodes",
        success: function(data) {
            if(data.nodes && data.nodes.length > 0) {
                that.nodes = data.nodes;
            }
            that.render();
        },
        dataType: 'jsonp'
    });
}

Graph.prototype.loadStreams = function() {
    var that = this;
    $.ajax({
        url: "http://localhost:8000/streams",
        success: function(data) {
            if(data.streams && data.streams.length > 0) {
                that.streams = data.streams;
            }
            that.render();
        },
        dataType: 'jsonp'
    });
}

Graph.prototype.loadTickets = function() {
    var that = this;
    $.ajax({
        url: "http://localhost:8000/tickets",
        success: function(data) {
            if(data.tickets && data.tickets.length > 0) {
                that.tickets = data.tickets;
            }
            that.render();
        },
        dataType: 'jsonp'
    });
}

$(window).load(function() {
    ASTRAL.graph = new Graph();
    ASTRAL.graph.draw();

    var ws = new WebSocket("ws://localhost:8000/events");
    ws.onmessage = function (theEvent) {
        var data = $.parseJSON(theEvent.data);
        if(data.type === "update") {
            ASTRAL.graph.draw();
        }
    };
});
