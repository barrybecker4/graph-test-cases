
function createRadialLayout(numNodes, graph) {
    var graphUI = initGraphUI();
    var grWidth = graphUI.width();
    var grHeight = graphUI.height();

    var radius = grWidth / 2 - 25;
    var grX = graphUI.position().left;
    var grY = graphUI.position().top;
    var angleDiff = Math.PI * 2 / numNodes;
    for (var i = 0; i < numNodes; i++) {
        var angle = i * angleDiff
        var xPos = Math.round(grX + radius + Math.cos(angle) * radius / 1.4);
        var yPos = Math.round(grY + radius + Math.sin(angle) * radius / 1.4);
        graphUI.append(graph.createNode(i, xPos, yPos));
    }
}

function createGridLayout(numNodes, graph) {
    var graphUI = initGraphUI();
    var margin = 10;
    var grWidth = graphUI.width() - margin;
    var grHeight = graphUI.height();

    var nodesOnEdge = Math.ceil(Math.sqrt(numNodes));
    var increment = (grWidth - margin) / nodesOnEdge;
    var grX = graphUI.position().left;
    var grY = graphUI.position().top;
    for (var i = 0; i < numNodes; i++) {
        var row = Math.floor(i / nodesOnEdge);
        var col = i % nodesOnEdge;
        var xPos = grX + margin + col * increment;
        var yPos = grY + margin + row * increment;
        graphUI.append(graph.createNode(i, xPos, yPos));
    }
}

function createRandomLayout(numNodes, graph) {
    var graphUI = initGraphUI();
    var margin = 10;
    var grWidth = graphUI.width() - 3 * margin;
    var grHeight = graphUI.height() - 3 * margin;

    var grX = graphUI.position().left;
    var grY = graphUI.position().top;
    for (var i = 0; i < numNodes; i++) {
        var xPos = grX + margin + Math.random() * grWidth;
        var yPos = grY + margin + Math.random() * grHeight;
        graphUI.append(graph.createNode(i, xPos, yPos));
    }
}

function createPoissonLayout(numNodes, graph) {
    var graphUI = initGraphUI();
    var margin = 10;
    var grWidth = graphUI.width() - 2 * margin;
    var grHeight = graphUI.height() - 2 * margin;
    var grX = graphUI.position().left;
    var grY = graphUI.position().top;

    var generator = new PoissonPointGenerator(grWidth, grHeight, margin, numNodes, 30);

    var numNodesAdded = generator.increment(numNodes - 1);
    var nodes = generator.getSamples();
    console.log((numNodes -1), " requested ", numNodesAdded, " actually added");
    if (nodes.length != numNodesAdded + 1)
        console.log("Error: nodes.len=" + nodes.length + " numNodesAdded=" + numNodesAdded);

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        graphUI.append(graph.createNode(i, grX + node.x, grY + node.y));
    }
    //graph.config.numNodes = nodes.length; I want to avoid this hack. Try to add the requested num nodes
}