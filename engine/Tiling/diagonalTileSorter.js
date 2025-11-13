class diagonalTileSorter extends TileSorter {
    constructor(tilesheet, neighborOrder=null, color="255, 255, 255") {
        neighborOrder = (!neighborOrder) ? ["00xxxxx0", "x000xxxx", "xxxxx000", "xxx000xx"] : neighborOrder
        super(tilesheet, neighborOrder, color); this.slope = true 
	}
    tile(x, y) { return new slopeTile(x, y, this.type) }
}