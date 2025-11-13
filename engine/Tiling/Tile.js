class Tile {
    constructor(x, y, type) {
        this.x = x; this.y = y; this.type = type; this.neighbors = "0000"; this.slope = 0; this.hasRect = false
    } 
	correct(directions, map) { this.neighbors = this.getNeighbors(directions, map) }
    getNeighbors(directions, map) {
        let neighbors = ""; directions.forEach((d) => {
            let tile = map.getTile(this.x + d[0], this.y + d[1]); if (tile) { neighbors += (tile.type === this.type) ? "1" : "0" } else { neighbors += "0"}
		})
        return neighbors
    }
}