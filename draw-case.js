// Features to add
// - combine random-case into draw case
// - random integer, or distance weights
// - add random edges
// - use poisson distribution to avoid overlap
// - add param for size of node circle
// - automatically don't show labels if more than 500 nodes
// - use bucketing to avoid N^2 edges

var graphConfig = new GraphConfiguration(5, false, 'radial', false, false, 'distance');
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

    graphConfig.numNodes = getNumNodes();
    graphConfig.isDirected = getGraphType();
    graphConfig.layoutType = getLayoutType();
    graphConfig.weightType = getWeightType();
    graphConfig.includePositions = getIncludePositions();
    graphConfig.includeWeights = getIncludeWeights();

    graph.generate();
    graph.outputTestCase();
});

function getNumNodes() {
    var num = $('#numNodes').val();
    return (!num || num <= 0) ? 5 : num;
}

function getGraphType() {
    var graphType = $("input[type='radio'][name='gtype']:checked").val();
    return graphType == 0 ? false : true;
}

function getLayoutType() {
    var layoutSelection = $("input[type='radio'][name='layoutType']:checked").val();
    switch (+layoutSelection) {
        case 0: return 'radial';
        case 1: return 'grid';
        case 2: return 'random';
        default: throw new Error("Unexpected layout selection: " + layoutSelection);
    }
}

function getWeightType() {
    var weightSelection = $("input[type='radio'][name='weightType']:checked").val();
    switch (+weightSelection) {
        case 0: return 'distance';
        case 1: return 'jittered_distance';
        case 2: return 'random';
        default: throw new Error("Unexpected weight selection: " + weightSelection);
    }
}

function getIncludePositions() {
    return $('#includePositions').is(":checked");
}

function getIncludeWeights() {
    return $('#includeWeights').is(":checked");
}

