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
                $(this).css('border-width','4px');
                $('#chooseTarget').show();
            } else {
                var node1 = self.bound.attr('node');
                var node2 = $(this).attr('node');
                var added = self.addOrRemoveEdge(node1, node2, self.bound, $(this));

                self.bound.css('border-color', 'black');
                self.bound.css('border-width','1px');
                self.bound = null;
                $('#chooseTarget').hide();
            }
        });
    }

    generate() {
        var start = 0;
        var end = parseInt(start) + parseInt(this.config.numNodes) - 1;

        this.edges = [];
        this.nodes = [];

        switch(this.config.layoutType) {
            case 'radial': this.createRadialLayout(start, end); break;
            case 'grid': this.createGridLayout(start, end); break;
            default: this.createRandomLayout(start, end); break;
        }
    }

    addOrRemoveEdge(node1, node2, elem1, elem2) {
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
            if (node2  < node1)
                connector = ['StateMachine', { curviness:-20 }];
        }

        var connection = jsPlumb.connect({
            source:elem1,
            target:elem2,
            connector: connector,
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
        this.nodes[this.draggedNode] = [x, y];
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

    createRadialLayout(start, end) {
        var graphUI = initGraphUI();
        var grWidth = graphUI.width();
        var grHeight = graphUI.height();

        var radius = grWidth / 2 - 25;
        var grX = graphUI.position().left;
        var grY = graphUI.position().top;
        var angleDiff = Math.PI * 2 / this.config.numNodes;
        for (var i = start; i <= end; i++) {
            var angle = i * angleDiff
            var xPos = Math.round(grX + radius + Math.cos(angle) * radius / 1.4);
            var yPos = Math.round(grY + radius + Math.sin(angle) * radius / 1.4);
            graphUI.append(this.createNode(i, xPos, yPos));
        }
    }

    createGridLayout(start, end) {
        var graphUI = initGraphUI();
        var margin = 10;
        var grWidth = graphUI.width() - margin;
        var grHeight = graphUI.height();

        var nodesOnEdge = Math.ceil(Math.sqrt(this.config.numNodes));
        var increment = (grWidth - margin) / nodesOnEdge;
        var grX = graphUI.position().left;
        var grY = graphUI.position().top;
        for (var i = start; i <= end; i++) {
            var row = Math.floor(i / nodesOnEdge);
            var col = i % nodesOnEdge;
            var xPos = grX + margin + col * increment;
            var yPos = grY + margin + row * increment;
            graphUI.append(this.createNode(i, xPos, yPos));
        }
    }

    createRandomLayout(start, end) {
        var graphUI = initGraphUI();
        var margin = 10;
        var grWidth = graphUI.width() - 3 * margin;
        var grHeight = graphUI.height() - 3 * margin;

        var grX = graphUI.position().left;
        var grY = graphUI.position().top;
        for (var i = start; i <= end; i++) {
            var xPos = grX + margin + Math.random() * grWidth;
            var yPos = grY + margin + Math.random() * grHeight;
            graphUI.append(this.createNode(i, xPos, yPos));
        }
    }

    createNode(i, xPos, yPos) {
        var newNode = '<div style="left:' + xPos +
                  'px; top:' + yPos + 'px;" id="node' + i +
                  '" class="node" draggable="true" ondragstart="graph.drag_start(event)" node="' + i + '">' + i + '</div>';
        this.nodes.push([xPos, yPos]);
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
               outputElement.append(round(this.nodes[i][0], 2) + " " + round(this.nodes[i][1], 2) + "<br>");
            }
        }
        for (var i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i];
            var weightAttr = this.config.includeWeights ? " " + round(edge.weight, 2) : "";
            outputElement.append(edge.node1 + " " + edge.node2 + weightAttr + "<br>");
        }
    }
}