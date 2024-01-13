
class Cell {
    // index: Int, position: IntLocation, itemIndices: Set[Int]
    constructor(index, positionKey, itemIndices) {
        this.index = index;
        this.positionKey = positionKey;
        this.itemIndices = itemIndices;
    }
}

class BinnedRegions {

    constructor(numBins, nodes) {
        this.numBins = numBins;
        this.xMin = Number.MAX_SAFE_INTEGER;
        this.yMin = Number.MAX_SAFE_INTEGER;
        this.binSize = this.calcBinSize(numBins, nodes);

        this.positionToCell = this.createCells(nodes); // Map[IntLocation, Cell]
    }

    createCells(nodes) {
        var cellMap = {}; // Map[IntLocation, Cell]
        var cellCount = 0

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var cellLocation = this.getCellLocation(node);
            if (cellMap[cellLocation]) {
                var existingCell = cellMap[cellLocation];
                existingCell.itemIndices[i] = true;
            } else {
                var itemIndices = {};
                itemIndices[i] = true;
                cellMap[cellLocation] = new Cell(cellCount, cellLocation, itemIndices);
                cellCount += 1;
            }
        }
        return cellMap;
      }

    getCellLocation(node) {
        return Math.floor((node.x - this.xMin) / this.binSize) + '_' + Math.floor((node.y - this.yMin) /this.binSize);
    }

    calcBinSize(numBins, nodes) {
        var xMax = 0;
        var yMax = 0;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.x < this.xMin) {
                this.xMin = node.x;
            }
            if (node.y < this.yMin) {
                this.yMin = node.y;
            }
            if (node.x > xMax) {
                xMax = node.x;
            }
            if (node.y > yMax) {
                yMax = node.y;
            }
        }
        var xRange = xMax - this.xMin;
        var yRange = yMax - this.yMin;

        var binSize = (xRange < yRange) ? xRange / numBins : yRange / numBins;
        return Math.floor(binSize);
    }

}

