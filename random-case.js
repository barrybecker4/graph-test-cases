var edges = [];
var possibleEdges = [];
var numNodes = 0;
var numEdges = 0;
var isDirected = false;
var isDAG = false;
var isWeighted = false;

$('#generate-case').click(function(){

    numNodes = $('#nodes').val();
    numEdges = $('#edges').val();

    if (!numNodes || numNodes <= 0) {
        numNodes = 1;
        alert('Invalid number of nodes!');
    }

    var start = 0;
    isDirected = $('#directed').is(":checked")
    isWeighted = $('#weighted').is(":checked")

    // max number of edges is n * (n-1) for directed and n*(n-1)/2 for undirected graphs
    var maxDirectedEdges = numNodes * (numNodes - 1);
    var maxUndirectedEdges = maxDirectedEdges / 2;
    if (isDirected && numEdges > maxDirectedEdges || !isDirected && numEdges > maxUndirectedEdges) {
        numEdges = isDirected ? maxDirectedEdges : maxUndirectedEdges ;
        alert('Maximum number of edges connecting ' + numNodes + ' nodes is ' + numEdges + '!');
    }

    edges = [];

    // generate all possible edge combinations to select from
    possibleEdges = [];

    // Hmm.. this is expensive. Instead of doing this, just randomly add edges - at least if num edges small compared to max
    for (i = 0; i < numNodes; i++) {
        for (j = i+1; j < numNodes; j++) {
            var v1 = i;
            var v2 = j;
            
            var w1 = null;
            var w2 = null;

            if (isWeighted) {
                var start = parseInt($('#minWeight').val());
                var end = parseInt($('#maxWeight').val());

                w1 = Math.floor(Math.random() * (end - start) + start);
                w2 = Math.floor(Math.random() * (end - start) + start);
            }

            possibleEdges.push({'v1' : v1, 'v2' : v2, 'w' : w1});

            if (isDirected)
                possibleEdges.push({'v1' : v2, 'v2' : v1, 'w' : w2});
        }
    }

    // randomly select the needed number of edges
    for (i = 0; i < numEdges; i++) {
        var edge = getAndRemoveRandomEdge();
        edges.push(edge);
    }
    
    outputTestCase();
});


function getAndRemoveRandomEdge()
{
    var idx     = Math.floor(Math.random() * possibleEdges.length);    
    var edge     = possibleEdges[idx];

    possibleEdges.splice(idx,1); // delete the edge from the array to avoid duplicate edges

    return edge;
}

function outputTestCase()
{
    $('#case').html('');
    $('#case').append("<h4>Input: </h4>")
    $('#case').append(numNodes+" "+numEdges+"<br>");

    for(i = 0; i<numEdges; i++)
    {
        $('#case').append(edges[i].v1 + " " + edges[i].v2 + ( isWeighted ? " " + edges[i].w : "" ) + "<br>");
    }
}


// DOM manipulation

$(document).ready(function(){
    $('#toggle-weight').hide();
});

$('#weighted').change(function(){
        if ($(this).is(':checked'))
            $('#toggle-weight').show();
        else
            $('#toggle-weight').hide();
        
});