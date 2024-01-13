
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
        this.positionToNearbyIndicesCache = new Map();
        this.positionToCell = this.createCells(nodes); // Map[IntLocation, Cell]
    }

    createCells(nodes) {
        var cellMap = {}; // Map[IntLocation, Cell]
        var cellCount = 0

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var cellLocation = this.getCellPositionKey(node);
            if (cellMap[cellLocation]) {
                var existingCell = cellMap[cellLocation];
                existingCell.itemIndices.add(i);
            } else {
                var itemIndices = new Set([i]);
                cellMap[cellLocation] = new Cell(cellCount, cellLocation, itemIndices);
                cellCount += 1;
            }
        }
        return cellMap;
    }

    // consider adding caching
    getNearbyNodeIndices(node) {
        var cellLocation = this.getCellPositionKey(node);
        if (!this.positionToNearbyIndicesCache.has(cellLocation)) {
            var position = this.parsePositionKey(cellLocation);

            var items = [];
            for (var i = position[0] - 1; i <= position[0] + 1; i++) {
                for (var j = position[1] - 1; j <= position[1] + 1; j++) {
                    var positionKey = i + '_' + j;
                    if (this.positionToCell[positionKey]) {
                        var itemsToAdd = [...this.positionToCell[positionKey].itemIndices].filter(idx => idx != node.id);
                        items = items.concat(itemsToAdd);
                    }
                }
            }
            this.positionToNearbyIndicesCache.set(cellLocation, items);
        }


        return this.positionToNearbyIndicesCache.get(cellLocation);
    }

    // The position key has the form "i_j"
    getCellPositionKey(node) {
        return Math.floor((node.x - this.xMin) / this.binSize) + '_' + Math.floor((node.y - this.yMin) /this.binSize);
    }

    // The position key has the form "i_j", this returns [i, j] in array form
    parsePositionKey(positionKey) {
        var parts = positionKey.split("_");
        return [+parts[0], +parts[1]];
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

