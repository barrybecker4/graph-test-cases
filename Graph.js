class Graph {

    constructor(graphConfig) {
        this.config = graphConfig;
        this.bound = null;
        this.draggedNode = -1;
        this.nodes = [];
        this.edges = new Map();
        this.binnedRegions = null;

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
                self.outputTestCase();

                self.bound.css('border-color', 'black');
                self.bound.css('border-width','1px');
                self.bound = null;
                $('#chooseTarget').hide();
            }
        });
    }

    generate() {
        var numNodes = this.config.numNodes;

        this.edges = new Map();
        this.nodes = [];

        switch(this.config.layoutType) {
            case 'poisson': createPoissonLayout(numNodes, this); break;
            case 'grid': createGridLayout(numNodes, this); break;
            case 'radial': createRadialLayout(numNodes, this); break;
            default: createRandomLayout(numNodes, this); break;
        }
        this.binnedRegions = new BinnedRegions(this.config.numBins, this.nodes);
        this.addAutoEdges();
    }

    addAutoEdges() {
        const numNodes = this.config.numNodes;
        const width = $("#graph").width();
        const startTime = new Date().getTime();
        const binSize = this.binnedRegions.binSize;
        const binSize3 = 3 * binSize;

        console.log("width=" + width + " binSize=" + binSize);

        // This is expensive. Binning the nodes helps performance.
        for (var i = 0; i < numNodes; i++) {
            if (!this.nodes[i]) throw new Error("could not find node at idx " + i);
            var nearbyNodeIndices = this.binnedRegions.getNearbyNodeIndices(this.nodes[i]);
            if (i % 10 == 0) {
                console.log("Processed " + i + " nodes");
            }
            let ct = 0;
            for (const j of nearbyNodeIndices) {
                var nearbyNode = this.nodes[j];
                var factor = (binSize3 - distance(this.nodes[i], nearbyNode)) / binSize3;
                var thresh = this.config.autoEdgeDensity * factor;
                const other = nearbyNode.id;
                if (Math.random() <= thresh && i != other) {
                    if (!this.edges.has(i + '_' + other)) {
                        if (this.addOrRemoveEdge(i, other)) ct++;
                    }
                    if (this.config.isDirected && !this.edges.has(other + '_' + i)) {
                        if (this.addOrRemoveEdge(other, i)) ct++;
                    }
                }
            }
            //console.log(ct + " edges added for node " + i + " out of " + nearbyNodeIndices.size + " nearby");
        }
        var msec = new Date().getTime() - startTime;
        this.outputTestCase();
        console.log("done adding auto-edges in " + msec / 1000 + "s");
    }

    addOrRemoveEdge(node1, node2) {

        if (node1 == node2 && !this.config.isDirected)
            return false;

        const key = node1 + '_' + node2;
        if (this.edges.has(key)) {
            const edge = this.edges.get(key);
            // if the edge exists. delete it
            if (edge.node1 && edge.node2 && ((edge.node1 == node1  && edge.node2 == node2)
                   || (!this.config.isDirected && edge.node1 == node2  && edge.node2 == node1))) {
                  jsPlumb.detach(edge.conn);
                  this.edges.delete(key);
                  return false;
            }
        }

        const elem1 = $('#node' + node1);
        const elem2 = $('#node' + node2);
        let connector = 'Straight';
        if (this.config.isDirected) { // draw edge as curve
            connector = ['StateMachine', { curviness: 20, proximityLimit: 90 }];
            if (node2 < node1)
                connector = ['StateMachine', { curviness: -20, size: 1, proximityLimit: 200 }];
        }

        var connection = jsPlumb.connect({
            source: elem1,
            target: elem2,
            connector: connector,
            cssClass: "edge",
            paintStyle:{ lineWidth: 1, strokeStyle: "#447", strokeOpacity: 0.2, outlineWidth: 0 },
            hoverPaintStyle:{ lineWidth: 3, strokeStyle: "#44C" },
            anchor:'Center',
            overlays: this.config.isDirected ? [["Arrow" , { width: 6, length: 6, location: 0.7 }]] : [],
        });
        this.edges.set(key, {
            node1: node1,
            node2: node2,
            conn: connection,
            weight: this.calculateWeight(this.nodes[+node1], this.nodes[+node2])
        });
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
        outputElement.append(this.config.numNodes + " " + this.edges.size + " " + this.config.includePositions + "<br>");

        if (this.config.includePositions) {
            for (var i = 0; i < this.nodes.length; i++) {
               outputElement.append(round(this.nodes[i].x, 2) + " " + round(this.nodes[i].y, 2) + "<br>");
            }
        }
        for (const edge of this.edges.values()) {
            var weightAttr = this.config.weightType != 'none' ? " " + round(edge.weight, 2) : "";
            outputElement.append(edge.node1 + " " + edge.node2 + weightAttr + "<br>");
        };
    }
}