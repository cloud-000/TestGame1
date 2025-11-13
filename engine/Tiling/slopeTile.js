class slopeTile extends Tile {
    constructor(x, y, type) { super(x, y, type); this.slope = 1 }
    checkEquals(neighbor1, neighbor2) {
        if (neighbor1 === "x" || neighbor2 === "x") { return false }
        for (let i = 0; i < Math.min(neighbor1.length, neighbor2.length); ++i) {
            let a1 = neighbor1[i]
            let a2 = neighbor2[i]
            if (a1 !== a2 && a1 !== "x" && a2 !== "x") {
                return false
            }
        }
        return neighbor1.length == neighbor2.length
    }
    correct(directions, map) {
        this.neighbors = this.getNeighbors(directions, map)
        let key = Object.keys(map.types[this.type + "slope"].key)
        for (let i = 0; i < key.length; ++i) {
            if (this.checkEquals(this.neighbors, key[i])) {
                this.neighbors = key[i]
                break;
            }
        }
        if (!this.neighbors.includes("x")) {
            this.neighbors = "x"
        }
    }
} 