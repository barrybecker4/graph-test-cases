class PoissonGrid {

    constructor(width, height, margin, radius) {
        this.cellSize = radius / Math.sqrt(2.0);
        this.xBins = Math.floor(width / this.cellSize + 1);
        this.yBins = Math.floor(height / this.cellSize + 1);
        this.grid = [];
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.radius = radius;
        this.samples = [];

        for (let i = 0; i < this.xBins; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.yBins; j++) {
                this.grid[i][j] = -1;
            }
        }
    }

    addNewElementIfPossible(index, k) {
        var point = this.samples[index];

        // try k random neighboring points, if none accepted, return -1
        for (let i = 0; i < k; i++) {
            var nbrPoint = this.getRandomNeighborOf(point);
            var distantEnough = this.isDistantFromAllNeighbors(nbrPoint);
            if (distantEnough) {
                return this.addSample(nbrPoint);
            }
        }
        return -1; // none added
    }

    addSample(point) {
        this.samples[this.samples.length] = point;
        var xIdx = this.getIdx(point.x);
        var yIdx = this.getIdx(point.y);
        if (this.grid[xIdx][yIdx] != -1) throw new Error("There is already a value at " + xIdx + " " + yIdx);
        this.grid[xIdx][yIdx] = this.samples.length - 1;
        return this.samples.length - 1;
    }

    getIdx(d) {
        return Math.floor(d / this.cellSize);
    }

    getRandomNeighborOf(point) {
        var x = -1;
        var y = -1;
        var ct = 0;
        while (x < this.margin || y < this.margin || x > this.width - this.margin || y > this.height - this.margin) {
          var randomRadius = this.radius + Math.random() * this.radius;
          var randomAngle = Math.random() * Math.PI * 2.0;
          x = point.x + randomRadius * Math.cos(randomAngle);
          y = point.y + randomRadius * Math.sin(randomAngle);
          ct ++;
        }
        if (ct > 3) console.log("Warning ct = " + ct);
        return new Node(-1, x, y);
    }


  // Look in all neighboring grid cells to see if anything within rad distance
  isDistantFromAllNeighbors(point) {
    var xIdx = this.getIdx(point.x);
    var yIdx = this.getIdx(point.y);
    var xMin = Math.max(xIdx - 2, 0);
    var xMax = Math.min(xIdx + 2, this.xBins - 1);
    var yMin = Math.max(yIdx - 2, 0)
    var yMax = Math.min(yIdx + 2, this.yBins - 1)
    for (var xi = xMin; xi <= xMax; xi++) {
        for (var yi = yMin; yi <= yMax; yi++) {
            var sampleIndex = this.grid[xi][yi];
            if (xi == xIdx && yi == yIdx && sampleIndex >= 0) {
                return false;
            }
            else {
                if (sampleIndex >= 0) {
                    var samplePoint = this.samples[sampleIndex];
                    if (distance(point, samplePoint) < this.radius) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
  }
}