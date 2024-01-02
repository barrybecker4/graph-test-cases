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


var numNodes = 5;
var base = 0;
var edges = [];
var isDirected = false;
var includePositions = false;
var bound = null;
var draggedNode = -1;

$('#includePositions').click(function() {
   includePositions = $('#includePositions').is(":checked");
   outputTestCase();
});

$('#generate').click(function() {
    var graph = $('#graph');
    jsPlumb.empty("graph");
    graph.html('');

    edges = [];
    nodes = [];
    isDirected = false;
    numNodes = $('#numNodes').val();
    if (!numNodes || numNodes<=0)
        numNodes = 5;

    var graphType = $("input[type='radio'][name='gtype']:checked").val();
    isDirected = graphType == 0 ? false : true;

    includePositions = $('#includePositions').is(":checked");

    var start = 0;
    var end = parseInt(start) + parseInt(numNodes) - 1;

    var grWidth = graph.width();
    var grHeight = graph.height();
    var radius = grWidth / 2 - 25;
    var grX = graph.position().left;
    var grY = graph.position().top;
    var angleDiff = Math.PI * 2 / numNodes;
    for (i = start; i <= end; i++) {
        var xPos = Math.round(grX + radius + Math.cos(i*angleDiff) * radius / 1.4);
        var yPos = Math.round(grY + radius + Math.sin(i*angleDiff) * radius / 1.4);
        var newNode = '<div style="left:' + xPos +
          'px; top:' + yPos + 'px;" id="node' + i +
          '" class="node" draggable="true" ondragstart="drag_start(event)" node="' + i + '">' + i + '</div>';
        nodes.push([xPos, yPos]);
        graph.append(newNode);
    }
    outputTestCase();
});

$(document).on('click', '.node', function() {
    if (!bound) {
        bound = $(this);
        $(this).css('border-color','blue');
        $(this).css('border-width','4px');
        $('#chooseTarget').show();
    } else {
        var node1 = bound.attr('node');
        var node2 = $(this).attr('node');
        var added = addOrRemoveEdge(node1,node2, bound, $(this));

        bound.css('border-color', 'black');
        bound.css('border-width','1px');
        bound = null;
        $('#chooseTarget').hide();
    }
})


var addOrRemoveEdge = function(node1, node2, elem1, elem2) {
    if (node1 == node2 && !isDirected)
            return false;

    for (i = 0; i < edges.length; i++) {
        // if the edge exist delete edge
        if(edges[i].node1 && edges[i].node2
           && ((edges[i].node1 == node1  && edges[i].node2 == node2)
               || (!isDirected && edges[i].node1 == node2  && edges[i].node2 == node1))) {
            jsPlumb.detach(edges[i].conn);
            edges.splice(i, 1);

            outputTestCase();
            return false;
        }
    }

    var connector = 'Straight';
    if (isDirected) { // draw edge as curve
        connector = ['StateMachine', { curviness:20 }];
        if (node2  < node1)
            connector = ['StateMachine', { curviness:-20 }];
    }

    var connection = jsPlumb.connect({
        source:elem1,
        target:elem2,
        connector: connector,
        anchor:'Center',
        overlays: isDirected ? [["Arrow" , { width:12, length:12, location:0.67 }]] : [],
    });
    edges.push({node1 : node1, node2: node2, conn: connection});
    outputTestCase(); // update the output testCases
    return true;
}

function outputTestCase() {
    $('#case').html('');
    $('#case').append("<h4>Input: </h4>")
    $('#case').append(numNodes + " " + edges.length + " " + includePositions + "<br>");

    if (includePositions) {
        for (var i = 0; i < nodes.length; i++) {
           $('#case').append(nodes[i][0] + " " + nodes[i][1] + "<br>");
        }
    }
    for (var i = 0; i < edges.length; i++) {
        $('#case').append(edges[i].node1 + " " + edges[i].node2 + "<br>");
    }
}
