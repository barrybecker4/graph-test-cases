class Graph {

    constructor(graphConfig) {
        this.config = graphConfig;
        this.bound = null;
        this.draggedNode = -1;
        this.nodes = [];
        this.edges = [];

        var self = this;
        $(document).on('click', '.node', function() {
            if (!self.bound) {
                self.bound = $(this);
                $(this).css('border-color','blue');
                $(this).css('border-width','3px');
                $('#chooseTarget').show();
            } else {
                var node1 = self.bound.attr('node');
                var node2 = $(this).attr('node');
                var added = self.addOrRemoveEdge(node1, node2);

                self.bound.css('border-color', 'black');
                self.bound.css('border-width','1px');
                self.bound = null;
                $('#chooseTarget').hide();
            }
        });
    }

    generate() {
        var numNodes = this.config.numNodes;

        this.edges = [];
        this.nodes = [];

        switch(this.config.layoutType) {
            case 'grid': createGridLayout(numNodes, this); break;
            case 'radial': createRadialLayout(numNodes, this); break;
            default: createRandomLayout(numNodes, this); break;
        }
        this.addAutoEdges();
    }

    addAutoEdges() {
        var numNodes = this.config.numNodes;
        var width = $("#graph").width();
        console.log("width = " + width);

        // This is expensive. Consider binning for large graphs
        for (var i = 0; i < numNodes; i++) {
            for (var j = i + 1; j < numNodes; j++) {
                var factor = (width - distance(this.nodes[i], this.nodes[j])) / width;
                var thresh = this.config.autoEdgeDensity * factor * factor;
                if (Math.random() <= thresh) {
                    this.addOrRemoveEdge(i, j);
                    if (this.config.isDirected) {
                        this.addOrRemoveEdge(j, i);
                    }
                }
            }
        }
    }

    addOrRemoveEdge(node1, node2) {
        var elem1 = $('#node' + node1);
        var elem2 = $('#node' + node2);
        if (node1 == node2 && !this.config.isDirected)
            return false;

        for (var i = 0; i < this.edges.length; i++) {
            // if the edge exists. delete it
            var edge = this.edges[i];
            if (edge.node1 && edge.node2
               && ((edge.node1 == node1  && edge.node2 == node2)
                   || (!this.config.isDirected && edge.node1 == node2  && edge.node2 == node1))) {
                jsPlumb.detach(edge.conn);
                this.edges.splice(i, 1);

                this.outputTestCase();
                return false;
            }
        }

        var connector = 'Straight';
        if (this.config.isDirected) { // draw edge as curve
            connector = ['StateMachine', { curviness:20 }];
            if (node2 < node1)
                connector = ['StateMachine', { curviness:-20 }];
        }

        var connection = jsPlumb.connect({
            source: elem1,
            target: elem2,
            connector: connector,
            cssClass: "edge",
            //paintStyle: {  // this does not work, unfortunately
            //      strokeWidth: 4,
            //      stroke: "rgba(86, 117, 103, 0.5)",
            //},
            anchor:'Center',
            overlays: this.config.isDirected ? [["Arrow" , { width:12, length:12, location:0.67 }]] : [],
        });
        this.edges.push({
            node1: node1,
            node2: node2,
            conn: connection,
            weight: this.calculateWeight(this.nodes[+node1], this.nodes[+node2])
        });
        this.outputTestCase();
        return true;
    }

    calculateWeight(node1, node2) {
        switch (this.config.weightType) {
            case 'none': return 0;
            case 'distance': return distance(node1, node2);
            case 'jittered_distance': return jittered_distance(node1, node2);
            case 'random': return round(Math.random() * 100, 1);
        }
    }

    drag_start(event) {
        this.draggedNode = +event.target.id.substring('node'.length);
        var style = window.getComputedStyle(event.target, null);
        var str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ','
            + (parseInt(style.getPropertyValue("top")) - event.clientY)+ ',' + event.target.id;
        event.dataTransfer.setData("Text", str);
    }

    drop(event) {
        var offset = event.dataTransfer.getData("Text").split(',');
        var dm = document.getElementById(offset[2]);
        var x = (event.clientX + parseInt(offset[0], 10));
        var y = (event.clientY + parseInt(offset[1], 10))
        dm.style.left = x + 'px';
        dm.style.top = y + 'px';
        this.nodes[this.draggedNode].setPosition(x, y);
        this.draggedNode = -1;
        jsPlumb.empty("#graph");
        event.preventDefault();
        this.outputTestCase();
        return false;
    }

    drag_over(event) {
        event.preventDefault();
        return false;
    }

    createNode(i, xPos, yPos) {
        var newNode = '<div style="left:' + xPos +
                  'px; top:' + yPos + 'px;" id="node' + i +
                  '" class="node" draggable="true" ondragstart="graph.drag_start(event)" node="' + i + '">' + i + '</div>';
        this.nodes.push(new Node(i, xPos, yPos));
        return newNode;
    }

    outputTestCase() {
        var outputElement = $('#case');
        outputElement.html('');
        outputElement.append("<h4>Result: </h4>")
        graph.serialize(outputElement);
    }

    serialize(outputElement) {
        outputElement.append(this.config.numNodes + " " + this.edges.length + " " + this.config.includePositions + "<br>");

        if (this.config.includePositions) {
            for (var i = 0; i < this.nodes.length; i++) {
               outputElement.append(round(this.nodes[i].x, 2) + " " + round(this.nodes[i].y, 2) + "<br>");
            }
        }
        for (var i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i];
            var weightAttr = this.config.weightType != 'none' ? " " + round(edge.weight, 2) : "";
            outputElement.append(edge.node1 + " " + edge.node2 + weightAttr + "<br>");
        }
    }
}