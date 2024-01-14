
class PoissonPointGenerator {

    constructor(width, height, margin, numPoints, k) {
        this.k = k ? k : 30;
        var radius = Math.max(2, Math.floor(Math.min(width, height) / Math.ceil(Math.sqrt(numPoints))));
        console.log(radius);

        this.grid = new PoissonGrid(width, height, margin, radius);
        this.activeList = new ActiveList(numPoints + k);
        this.activePoint = new Node(-1, width * Math.random(), height * Math.random());
        this.activeIndex = this.grid.addSample(this.activePoint);
        this.activeList.addElement(this.activeIndex);
    }

    getSamples() {
        return this.grid.samples;
    }

    // @param numPoints the number of points that we would like to add.
    // @return the number of points that were actually added.
    increment(numPoints) {
        var count = 0;
        var numAdded = 0;

        while (!this.activeList.isEmpty() && count < numPoints) {
            // get random index, generate k points around it, add one of the grid if possible, else delete it.
            var index = this.activeList.removeRandomElement();
            if (index < 0) throw new Error(index, " cannot be less than 0");
            var newIndex = this.grid.addNewElementIfPossible(index, this.k);
            if (newIndex >= 0) {
                this.activeList.addElement(newIndex);
                this.activeList.addElement(index) // add it back
                numAdded++;

            }
            count += 1;
        }
        return numAdded;
    }

}