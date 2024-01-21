
class PoissonPointGenerator {

    constructor(width, height, margin, numPoints, k) {
        this.k = k ? k : 30;
        var radius = Math.max(2, Math.floor((Math.min(width, height) - margin) / Math.ceil(Math.sqrt(1.4 * numPoints) + 1)));
        console.log(radius);

        this.grid = new PoissonGrid(width, height, margin, radius);
        this.activeList = new ActiveList(numPoints + k);
        const xpos = 0.4 * width + 0.2 * width * Math.random();
        const ypos = 0.4 * height + 0.2 * height * Math.random();
        this.activePoint = new Node(-1, xpos, ypos);
        this.activeIndex = this.grid.addSample(this.activePoint);
        this.activeList.addElement(this.activeIndex);
    }

    getSamples() {
        return this.grid.samples;
    }

    // @param numPoints the number of points that we would like to add.
    // @return the number of points that were actually added.
    increment(numPoints) {
        var numAdded = 0;

        while (!this.activeList.isEmpty() && numAdded < numPoints) {
            // get random index, generate k points around it, add one of the grid if possible, else delete it.
            var index = this.activeList.removeRandomElement();
            if (index < 0) throw new Error(index, " cannot be less than 0");
            var newIndex = this.grid.addNewElementIfPossible(index, this.k);
            if (newIndex >= 0) {
                this.activeList.addElement(newIndex);
                this.activeList.addElement(index) // add it back
                numAdded++;
            }
        }
        return numAdded;
    }

}