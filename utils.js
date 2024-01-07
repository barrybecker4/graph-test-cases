

// @return value rounded to the specified number of decimals
function round(value, decimals) {
    var scale = Math.pow(10, decimals)
    return Math.round(value * scale) / scale;
}

// @return the distance between 2 points.
function distance(pt1, pt2) {
   var diffX = pt1[0] - pt2[0];
   var diffY = pt1[1] - pt2[1];
   return Math.sqrt(diffX * diffX + diffY * diffY);
}