class ActiveList {

    constructor(maxPoints) {
        this.maxPoints = maxPoints;
        this.array = [];
        for (let i = 0; i < maxPoints; i++) this.array.push(-1);
        this.currentArrayLength = 0;
    }

    removeRandomElement() {
        if (this.currentArrayLength == 0) {
          throw new Error("Cannot remove an element when there are none!")
        }
        var index = Math.floor(Math.random() * this.currentArrayLength);
        var value = this.array[index];
        if (index < this.currentArrayLength - 1) {
          this.array[index] = this.array[this.currentArrayLength - 1];
        }
        this.currentArrayLength -= 1;
        return value;
    }

    addElement(index) {
        if (index < 0) throw new Error(index, " should not be less than 0");
        this.array[this.currentArrayLength] = index;
        this.currentArrayLength += 1;
    }

    isEmpty() {
        return this.currentArrayLength == 0;
    }

    getSize() {
        return this.currentArrayLength;
    }

}