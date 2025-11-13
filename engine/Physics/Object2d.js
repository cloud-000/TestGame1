class Object2d {
	static NAME = "Object2d"
	#destroyed = false
	#camera = null; #hasAnimation=false;
	#cameraAttraction = {
		x: 0,
		y: 0,
		targetX: null, // don't change targetX&Y
		targetY: null,
		radius: 350,
		innerRadius: 150,
		zoom: 1.25,
		zoomPower: 1,
		enabled: true, // enabled in use?
		hasAttraction: false, // called .addPointOfInterest ?
		power: 1, // 0-1 range
		parent: null
	}
	static t = {NORMAL: 0, SCENE: 1, CAMERA: 2, PARENT: 3}
	constructor() {
        this.x = 0
        this.y = 0
        this.vx = 0
        this.vy = 0
		this._parent = null
		this.type = Object2d.t.NORMAL
		this.IS_OBJECT_2D = true
		this.animation = null
    }
	__hasAnimation() {return this.#hasAnimation}
	attachAnimation(animation) {this.animation = animation; this.#hasAnimation=true}
	drawAnimation(context, camera, ox=0, oy=0, center=true, scaleImage=1, flip=false) {if (this.#hasAnimation) {
		this.animation.draw(context, camera.toScreenX(this.x + ox), camera.toScreenY(this.y + oy), camera.scale, 0, center, scaleImage, flip)
	}}
	updateAnimation(dt) {
		if (this.#hasAnimation) {
			this.animation.update(dt)
		}
	}
	// best to NOT call __ methods unless you are changing framework
	__becomeCameraTarget(camera) {this.#camera = camera}
	__parentCamera() {return this.#camera}
	__stopBeingCameraTarget() {this.#camera = null}
	// these don't activate what their function names are, they are called from Camera2d methods
	__becomeCameraInterest(camera) {this.#cameraAttraction.parent = camera; this.#cameraAttraction.hasAttraction=true}
	__stopBeingCameraInterest(camera) {this.#cameraAttraction.parent = null; this.#cameraAttraction.hasAttraction=false}
	getCameraAttractionObject() {return this.#cameraAttraction}

	destroy() {
		this.#destroyed = true
		this._parent = null
		this.animation.destroy()
		this.animation = null
		if (this.__parentCamera()) {this.__parentCamera().setTarget(null)}
		if (this.#cameraAttraction.parent) {
			this.#cameraAttraction.parent.removePointOfInterest(this)	
		}
	}

	getDestroyed() { return this.#destroyed }

	setParent(parent) { this._parent = parent }

    update(dt) {
        this.x += this.vx * dt
        this.y += this.vy * dt
    }

    draw(context, camera) {
		context.fillRect(camera.toScreenX(this.x), camera.toScreenY(this.y), 10*camera.scale, 10*camera.scale)
    }
	
	debugDraw(context, camera) {
		let x = camera.toScreenX(this.x + this.#cameraAttraction.x)
		let y = camera.toScreenY(this.y + this.#cameraAttraction.y)
		if (this.#cameraAttraction.hasAttraction) {
			context.strokeStyle = __CONFIG.BASIC.COLORS.DEBUG.STROKE
			drawCircle(context, x, y, this.#cameraAttraction.radius*camera.scale, 2*camera.scale)
			drawCircle(context, x, y, this.#cameraAttraction.innerRadius*camera.scale, 2*camera.scale)
			if (this.#cameraAttraction.targetX != null) {
				drawLine(context, x, y, camera.toScreenX(this.#cameraAttraction.targetX), camera.toScreenY(this.#cameraAttraction.targetY))
				this.#cameraAttraction.targetX = null
				this.#cameraAttraction.targetY = null

			}
		}
		camera.debugText(context, x, y, `x: ${Math.round(this.x)}, y: ${Math.round(this.y)}`)
	}
}

class Object2dParent extends Object2d {
	constructor() {
		super()
		this.children = []
		this.children_keys = {}
		this.type = Object2d.t.PARENT
	}

	destroy() {
		super.destroy()
		this.clear(true)
		this.children_keys = null
	}

	clear(destroy=false) {
		this._forAllChildren(i => {
			this.children[i].destroy()
			if (destroy) { delete this.children[i] } else { this.children.splice(i, 1) }
		})
		Object.keys(this.children_keys = k => {
			delete this.children_keys[k]
		})
	}

	_forAllChildren(callback) { for (let i = this.children.length - 1; i >= 0; i--) { callback.call(null, i) } }
	
	addChild(child) {
		this.children.push(child)
		if (child.IS_OBJECT_2D) {
			child.setParent(this)
		}
	}

	removeChild(child) { this.children.splice(this.children.indexOf(child), 1) }

	addChildById(child, id) {
		this.addChild(child)
		this.children_keys[id] = child
		return id
	}

	getChildById(id) {return this.children_keys[id]}

	removeChildById(id) {
		 this.removeChild(this.getChildById(id))
		 delete this.children_keys[id]
	}

	update(dt) { super.update(dt); this._forAllChildren(i => this.children[i].update(dt)) }

	draw(context, camera) { this._forAllChildren(i => this.children[i].draw(context, camera)) }

	debugDraw(context, camera) {this._forAllChildren(i => this.children[i].debugDraw(context, camera))}
}