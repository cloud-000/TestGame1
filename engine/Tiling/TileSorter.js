class TileSorter {
    // bail is when no tiles fit, customSet is usally null
    constructor(tilesheet, neighborOrder = null, color="255, 255, 255", customSet=null, bail=0) {
        this.key = {}
        let images = tilesheet.images(color); this.key["x"] = images[bail];
        if (!customSet) {
            let order = neighborOrder ? neighborOrder : ["0110", "0111", "0011","1110", "1111", "1011","1100", "1101", "1001","0100", "0101", "0001","0010", "1010", "1000","0000"]
            for (let i = 0; i < Math.min(order.length, images.length); ++i) {this.key[order[i]] = images[i]}
            order = null;
        } else {
            this.__customSet(images, customSet)
        }
        this.type = null; this.solid = true; this.sheet = tilesheet; this.slope = false
    }
    __customSet(images, map) {
        let keys = Object.keys(map)
        for (let i = 0; i < keys.length; ++i) {
            this.key[keys[i]] = images[map[keys[i]]]
        }
        keys = null
    }
    draw(context, camera, tile, size, scale) {
        let rect = this.key[tile.neighbors] || this.key["x"]; 
		context.drawImage(this.sheet.image, rect.x, rect.y, rect.width, rect.height, camera.toScreenX(Math.floor(size*tile.x*scale)), camera.toScreenY(Math.floor(size*tile.y*scale)), Math.floor(rect.width*scale*camera.scale), Math.floor(rect.height*scale*camera.scale));
		rect = null
    }
    tile(x, y) { return new Tile(x, y, this.type) }
}