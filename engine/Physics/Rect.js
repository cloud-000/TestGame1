class Rect extends Object2d {
	constructor(x, y, w, h) {
		super()
		this.x = x
		this.y = y
		this.width = w
		this.height = h
		this.getCameraAttractionObject().x = this.width * 0.5
		this.getCameraAttractionObject().y = this.height * 0.5
	}
	
	get left() {return this.x}
	set left(x) {this.x = x}
	get right() {return this.x + this.width}
	set right(x) {this.x = x - this.width}
	get top() {return this.y}
	set top(y) {this.y = y}
	get bottom() {return this.y + this.height}
	set bottom(y) {this.y = y - this.height}
	
	copy() {return new Rect(this.x, this.y, this.width, this.height)}

	copyOnto(rect) {rect.x = this.x, rect.y = this.y, rect.width = this.width, rect.height=this.height}

	colliderect(rect) {
		return !(
			((this.y + this.height) <= (rect.y)) ||
			(this.y >= (rect.y + rect.height)) ||
			((this.x + this.width) <= rect.x) ||
			(this.x >= (rect.x + rect.width))
		)
	}

	draw(context, camera, lw=1) {
		drawRect(context, camera.toScreenX(this.x), camera.toScreenY(this.y), this.width*camera.scale, this.height*camera.scale, lw*camera.scale)
	}
}
