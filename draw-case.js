// Features to add
// - use poisson distribution to avoid overlap
// - add param for size of node circle
// - automatically don't show labels if more than 500 nodes
// - combine random-case into draw case
// - random integer, or distance weights
// - add random edges
// - use bucketing to avoid N^2 edges

var graphConfig = new GraphConfiguration(5, false, 'radial', false, false);
var graph = new Graph(graphConfig);

$('#includePositions').click(function() {
   graphConfig.includePositions = getIncludePositions();
   graph.outputTestCase();
});

$('#includeWeights').click(function() {
   graphConfig.includeWeights = getIncludeWeights();
   graph.outputTestCase();
});

$('#generate').click(function() {
    jsPlumb.empty("graph");

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

    graph.generate();
    graph.outputTestCase();
});

function getIncludePositions() {
    return $('#includePositions').is(":checked");
}

function getIncludeWeights() {
    return $('#includeWeights').is(":checked");
}

