

// @return value rounded to the specified number of decimals
function round(value, decimals) {
    var scale = Math.pow(10, decimals)
    return Math.round(value * scale) / scale;
}

// @return the distance between 2 points.
function distance(pt1, pt2) {
   var diffX = pt1.x - pt2.x;
   var diffY = pt1.y - pt2.y;
   return Math.sqrt(diffX * diffX + diffY * diffY);
}

function jittered_distance(pt1, pt2) {
   var dist = distance(pt1, pt2);
   return gaussianRandom(1.0, 0.2) * dist;
}

function initGraphUI() {
    var graphUI = $('#graph');
    graphUI.html('');
    return graphUI;
}

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random(); // Converting [0, 1) to (0, 1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}
