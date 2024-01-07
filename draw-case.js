// Features to add
// - refactor out to separate encapsulated file
//   - separate file for UI
//   - separate file for graph
//   - separate file for layouts
// - use poisson distribution to avoid overlap
// - add param for size of node circle
// - automatically don't show labels if more than 500 nodes
// - combine random-case into draw case
// - random integer, or distance weights
// - add random edges
// - use bucketing to avoid N^2 edges

function drag_start(event) {
    draggedNode = +event.target.id.substring('node'.length);
    var style = window.getComputedStyle(event.target, null);
    var str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ','
        + (parseInt(style.getPropertyValue("top")) - event.clientY)+ ',' + event.target.id;
    event.dataTransfer.setData("Text", str);
}

function drop(event) {
    var offset = event.dataTransfer.getData("Text").split(',');
    var dm = document.getElementById(offset[2]);
    var x = (event.clientX + parseInt(offset[0], 10));
    var y = (event.clientY + parseInt(offset[1], 10))
    dm.style.left = x + 'px';
    dm.style.top = y + 'px';
    nodes[draggedNode] = [x, y];
    draggedNode = -1;
    jsPlumb.empty("#graph");
    event.preventDefault();
    outputTestCase();
    return false;
}

function drag_over(event) {
    event.preventDefault();
    return false;
}

var graphConfig = new GraphConfiguration(5, false, 'radial', false, false);
var bound = null;
var draggedNode = -1;
var nodes = [];
var edges = [];

$('#includePositions').click(function() {
   graphConfig.includePositions = getIncludePositions();
   outputTestCase();
});

$('#includeWeights').click(function() {
   graphConfig.includeWeights = getIncludeWeights();
   outputTestCase();
});

$('#generate').click(function() {
    jsPlumb.empty("graph");

    edges = [];
    nodes = [];
    graphConfig.isDirected = false;
    graphConfig.numNodes = $('#numNodes').val();
    if (!graphConfig.numNodes || graphConfig.numNodes <= 0)
        graphConfig.numNodes = 5;

    var graphType = $("input[type='radio'][name='gtype']:checked").val();
    graphConfig.isDirected = graphType == 0 ? false : true;

    var graphLayoutSelection = $("input[type='radio'][name='layout']:checked").val();
    switch (+graphLayoutSelection) {
        case 0: graphConfig.layout = 'radial'; break;
        case 1: graphConfig.layout = 'grid'; break;
        case 2: graphConfig.layout = 'random'; break;
        default: throw new Error("Unexpected layout selection: " + graphLayoutSelection);
    }

    graphConfig.includePositions = getIncludePositions();
    graphConfig.includeWeights = getIncludeWeights();

    var start = 0;
    var end = parseInt(start) + parseInt(graphConfig.numNodes) - 1;

    switch(graphConfig.layout) {
        case 'radial': createRadialLayout(start, end); break;
        case 'grid': createGridLayout(start, end); break;
        default: createRandomLayout(start, end); break;
    }

    outputTestCase();
});

function createRadialLayout(start, end) {
    var graph = $('#graph');
    graph.html('');
    var grWidth = graph.width();
    var grHeight = graph.height();

    var radius = grWidth / 2 - 25;
    var grX = graph.position().left;
    var grY = graph.position().top;
    var angleDiff = Math.PI * 2 / graphConfig.numNodes;
    for (i = start; i <= end; i++) {
        var angle = i * angleDiff
        var xPos = Math.round(grX + radius + Math.cos(angle) * radius / 1.4);
        var yPos = Math.round(grY + radius + Math.sin(angle) * radius / 1.4);
        graph.append(createNode(i, xPos, yPos));
    }
}

function createGridLayout(start, end) {
    var graph = $('#graph');
    graph.html('');
    var margin = 10;
    var grWidth = graph.width() - margin;
    var grHeight = graph.height();

    var nodesOnEdge = Math.ceil(Math.sqrt(graphConfig.numNodes));
    var increment = (grWidth - margin) / nodesOnEdge;
    var grX = graph.position().left;
    var grY = graph.position().top;
    for (i = start; i <= end; i++) {
        var row = Math.floor(i / nodesOnEdge);
        var col = i % nodesOnEdge;
        var xPos = grX + margin + col * increment;
        var yPos = grY + margin + row * increment;
        graph.append(createNode(i, xPos, yPos));
    }
}

function createRandomLayout(start, end) {
    var graph = $('#graph');
    graph.html('');
    var margin = 10;
    var grWidth = graph.width() - 3 * margin;
    var grHeight = graph.height() - 3 * margin;

    var grX = graph.position().left;
    var grY = graph.position().top;
    for (i = start; i <= end; i++) {
        var xPos = grX + margin + Math.random() * grWidth;
        var yPos = grY + margin + Math.random() * grHeight;
        graph.append(createNode(i, xPos, yPos));
    }
}

function createNode(i, xPos, yPos) {
    var newNode = '<div style="left:' + xPos +
              'px; top:' + yPos + 'px;" id="node' + i +
              '" class="node" draggable="true" ondragstart="drag_start(event)" node="' + i + '">' + i + '</div>';
    nodes.push([xPos, yPos]);
    return newNode;
}

$(document).on('click', '.node', function() {
    if (!bound) {
        bound = $(this);
        $(this).css('border-color','blue');
        $(this).css('border-width','4px');
        $('#chooseTarget').show();
    } else {
        var node1 = bound.attr('node');
        var node2 = $(this).attr('node');
        var added = addOrRemoveEdge(node1, node2, bound, $(this));

        bound.css('border-color', 'black');
        bound.css('border-width','1px');
        bound = null;
        $('#chooseTarget').hide();
    }
})


var addOrRemoveEdge = function(node1, node2, elem1, elem2) {
    if (node1 == node2 && !graphConfig.isDirected)
        return false;

    for (i = 0; i < edges.length; i++) {
        // if the edge exists. delete it
        if (edges[i].node1 && edges[i].node2
           && ((edges[i].node1 == node1  && edges[i].node2 == node2)
               || (!graphConfig.isDirected && edges[i].node1 == node2  && edges[i].node2 == node1))) {
            jsPlumb.detach(edges[i].conn);
            edges.splice(i, 1);

            outputTestCase();
            return false;
        }
    }

    var connector = 'Straight';
    if (graphConfig.isDirected) { // draw edge as curve
        connector = ['StateMachine', { curviness:20 }];
        if (node2  < node1)
            connector = ['StateMachine', { curviness:-20 }];
    }

    var connection = jsPlumb.connect({
        source:elem1,
        target:elem2,
        connector: connector,
        anchor:'Center',
        overlays: graphConfig.isDirected ? [["Arrow" , { width:12, length:12, location:0.67 }]] : [],
    });
    edges.push({node1 : node1, node2: node2, conn: connection, weight: distance(nodes[+node1], nodes[+node2])});
    outputTestCase();
    return true;
}

function getIncludePositions() {
    return $('#includePositions').is(":checked");
}

function getIncludeWeights() {
    return $('#includeWeights').is(":checked");
}

function outputTestCase() {
    $('#case').html('');
    $('#case').append("<h4>Result: </h4>")
    $('#case').append(graphConfig.numNodes + " " + edges.length + " " + graphConfig.includePositions + "<br>");

    if (graphConfig.includePositions) {
        for (var i = 0; i < nodes.length; i++) {
           $('#case').append(round(nodes[i][0], 2) + " " + round(nodes[i][1], 2) + "<br>");
        }
    }
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        var weightAttr = graphConfig.includeWeights ? " " + round(edge.weight, 2) : "";
        $('#case').append(edge.node1 + " " + edge.node2 + weightAttr + "<br>");
    }
}
