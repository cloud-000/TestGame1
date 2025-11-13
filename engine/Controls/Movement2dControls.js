class Movement2dControls extends Controls {
	constructor(up="w", left="a", down="s", right="d") {
		super()
		this.registerKey("right", right)
		this.registerKey("left", left)
		this.registerKey("up", up)
		this.registerKey("down", down)
	}
	axisX() { return this.getControl("right", true) - this.getControl("left", true) }
	axisY() { return this.getControl("up", true) - this.getControl("down", true) }
}