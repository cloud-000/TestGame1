class Scene2d extends Object2dParent {
	constructor() {
		super()
		this.camera = new Camera2d()
		this.type = Object2d.t.SCENE
	}

	destroy() {
		super.destroy()
		this.camera.destroy()
		this.camera = null
	}

	update(dt) {
		super.update(dt)
		this.camera.update(dt)
	}
	
	draw(context, camera=this.camera) { 
		super.draw(context, camera)
		if (camera.debug) {
			this.debugDraw(context, camera)
			this.debugCameraPosition(context, camera)
		}
	}

	debugCameraPosition(context, camera) {
		context.strokeStyle = __CONFIG.BASIC.COLORS.DEBUG.STROKE
		context.lineWidth = this.camera.scale
		let tx = this.camera.__getDisplayOffsetX()
		let ty = this.camera.__getDisplayOffsetY()
		let x = camera.toScreenX(tx)
		let y = camera.toScreenY(ty)
		let s = this.camera.scale * 20
		context.strokeRect(x - s*0.5, y-s*0.5, s, s)
		// camera.debugText(context, x, y, "x:{0} y:{1}".format(Math.round(tx), Math.round(ty)))
	}
}