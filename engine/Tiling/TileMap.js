class TileMap {
    constructor() {
        /*
        Do NOT create objects for every tile; instead optimize with one image, one object.
        Tile.drawatxy
        Also OPTIMIZE only loop through tiles on screen
        */
        this.data = {} // HashMap<String, Tile> like "1, 5" stores a Tile object
        this.types = {} // HashMap<Integer, TileSorter> like "stone" stores a TileSorter Object
        this.tile = 16 // the tile size
        this.scale = 1;
        this.screenSize = [0, 0, 0] // width, height, area (width*height)
        this.directions = [ // neighbor order
            [0, -1], // up
            [1, 0], // right
            [0, 1], // down
            [-1, 0] // left
        ]
        this.slopeDirections = [
            [-1, -1], // top left
            [0, -1], // top middle
            [1, -1], // top right
            [1, 0], // middle right
            [1, 1], // bottom right
            [0, 1], // bottom middle
            [-1, 1], // bottom left
            [-1, 0] // middle left
        ]
    }

    fill(rect, type, sloped=false) {
        let x = (rect.width < 0) ? rect.x + rect.width : rect.x;let y = (rect.height < 0) ? rect.y + rect.height: rect.y;let w = Math.abs(rect.width);let h = Math.abs(rect.height)
    	for (let _x = 0; _x < w; ++_x) {for (let _y = 0; _y < h; ++_y) {this.setTile(x + _x, y + _y, type, sloped)}}
    }
    getData() {
        let _ = [];let data = Object.values(this.data)
        for (const d of data) {_.push({x: d.x,y: d.y,type : d.type,slope: d.slope})}
        return _
    }
    load(data) {this.data = {}, data.forEach(d => this.setTile(d.x, d.y, d.type, d.slope))}
    getSolid(name) { return this.types[name].solid }
    addType(name, sorter, sloped=false) {sorter.type = name, this.types[name + (sloped ? "slope" : "")] = sorter}
    draw(context, camera) {
		let values = Object.values(this.data)
		let size = Math.floor(this.screenSize[2]/(camera.scale**2)) + 1
        if (size >= values.length) { values.forEach(t => this.types[t.type + ((t.slope == 0) ? "" : "slope")].draw(context, camera, t, this.tile, this.scale))
		} else {
            let scrollX = Math.floor(camera.getOffsetX()/(this.tile*this.scale))
            let scrollY = Math.floor(camera.getOffsetY()/(this.tile*this.scale))
			let sx = Math.floor(this.screenSize[0]/(2*camera.scale)) + 1
			let sy = Math.floor(this.screenSize[1]/(2*camera.scale)) + 1
            for (let y = -sy; y < sy; ++y) {
                for (let x = -sx - 1; x < sx; ++x) {
                    let t = this.getTile(x - scrollX, y - scrollY)
                    if (t) {
                        this.types[t.type + ((t.slope == 0) ? "" : "slope")].draw(context, camera, t, this.tile, this.scale)
                    }
                }
            }
        }
    }
    getTile(x, y) { return this.data[this.key(x, y)] }
    setTile(x, y, type=null, sloped=false) {
        delete this.data[this.key(x, y)]
        if (type !== null) { this.data[this.key(x, y)] = this.genTile(type + (sloped ? "slope" : ""), x, y) }
    }
    autoMap() {Object.values(this.data).forEach(t => t.correct((t.slope == 0) ? this.directions : this.slopeDirections, this))}
    // a function that generates a tile given type and position
    genTile(type, x, y) { let tile = this.types[type].tile(x, y); return tile }
    key(x, y) { return x + ", " + y}
    resize(canvas) {
        this.screenSize[0] = Math.ceil(canvas.width/(this.tile * this.scale))
        this.screenSize[1] = Math.ceil(canvas.height/(this.tile * this.scale))
        this.screenSize[2] = this.screenSize[0] * this.screenSize[1]
    }
}