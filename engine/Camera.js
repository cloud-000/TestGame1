class BasicCamera2d extends Object2d {
    #scale = 1
	#hiddenScale = 1/(16*devicePixelRatio)
	#scaleOffset = 0
	#hiddenOffset = {x: 0, y: 0}
	#__isDebug = false
	constructor() {
        super()
		this.type = Object2d.t.CAMERA
		this.scale = 1
		this.window = {width: 0, height: 0}
		this.__offset = {x: 0, y: 0, easeX: 0.05, easeY: 0.1}
	}
	debugText(context, x, y, text, size=18) {
		drawText(context, x, y, text, `${this.scale*size}${__CONFIG.BASIC.COLORS.DEBUG.FONT}`, __CONFIG.BASIC.COLORS.DEBUG.TEXT, 0)
	}
	update(dt) {
		super.update(dt)
		this.#hiddenOffset.x += (this.__offset.x - this.#hiddenOffset.x)*this.__offset.easeX*dt
		this.#hiddenOffset.y += (this.__offset.y - this.#hiddenOffset.y)*this.__offset.easeY*dt
		this.#hiddenOffset.x = _clampy(Math.round(this.#hiddenOffset.x * 100)/100, 0.2, -0.2, 0)
		this.#hiddenOffset.y = _clampy(Math.round(this.#hiddenOffset.y * 100)/100, 0.2, -0.2, 0)
	}
	set scale(s) { this.#scale = s }
	getTrueScale() {return this.#scale}
	changeScale(delta) {this.scale = delta + this.getTrueScale()}
	get scale() { return roundToNearestMultiple(this.__getDisplayScale(), this.#hiddenScale)*devicePixelRatio }
	get scaleOffset () {return this.#scaleOffset}
	set scaleOffset(o) {this.#scaleOffset = o}
	setDimensions(w, h) {this.window.width = w*0.5, this.window.height = h*0.5}
	toScreenX(x) { return Math.round(Math.floor(x + this.getOffsetX())*this.scale) + this.window.width }
	toScreenY(y) { return Math.round(Math.floor(y + this.getOffsetY())*this.scale) + this.window.height }
	getOffsetX() {return -Math.floor(this.__getDisplayOffsetX()+this.#hiddenOffset.x)}
	getOffsetY() {return -Math.floor(this.__getDisplayOffsetY()+this.#hiddenOffset.y)}
	__getDisplayOffsetX() {return this.x}
	__getDisplayOffsetY() {return this.y}
	__getDisplayScale() {return this.#scale + this.#scaleOffset}
	__setHiddenDPR(dpr) {this.#hiddenScale = 1/(16*dpr)}
	set offsetX(v) {this.__offset.x = v}
	set offsetY(v) {this.__offset.y = v}
	get offsetX() {return this.__offset.x}
	get offsetY() {return this.__offset.y}
	set debug(debug) {this.#__isDebug = debug}
	get debug() {return this.#__isDebug}
}

class Camera2d extends BasicCamera2d {
	#target = null
	#hasTarget = false
	#smoothedX = 0
	#smoothedY = 0
	#smoothScale = 1
	#smoothEase = 0.1
	#smoothScaleEase = 0.05
	#lockX = false
	#lockY = false
	#lockMargin = 2
	constructor() {
		super()
		this.ease = {x: 0.125, y: 0.1}
		this.track = {x: 0, y: 0}
		this.pointsOfInterest = []
	}

	addPointOfInterest(object) {
		this.pointsOfInterest.push(object)
		object.__becomeCameraInterest(this)
	}

	removePointOfInterest(object) {
		this.pointsOfInterest.splice(this.pointsOfInterest.indexOf(object), 1)
		object.__stopBeingCameraInterest(this)
	}

	update(dt) {
		super.update(dt)
		if (this.#hasTarget) {
			this.trackTarget(this.#target)
			this.x += this.track.x * dt
			this.y += this.track.y * dt
		}
		let newCamX = 0
		let newCamY = 0
		let newScale = 0
		let length = 0
		this.pointsOfInterest.forEach(interest => {
			let attraction = interest.getCameraAttractionObject()
			if (attraction.enabled) {
				let x = interest.x + attraction.x
				let y = interest.y + attraction.y
				let boundingCheck = rangeCheck(this.x, x + attraction.radius, x - attraction.radius) && rangeCheck(this.y, y + attraction.radius, y - attraction.radius)
				if (boundingCheck) { // sqrt computation are cost heavy, so skip
					let d = (x- this.x)**2 + (y - this.y)**2
					d = Math.sqrt(d)
					if (d < attraction.radius) {
						if (d < attraction.innerRadius) {
							newScale += (attraction.zoom - this.getTrueScale())
							newCamX += (x - this.x) * attraction.power
							newCamY += (y - this.y) * attraction.power
						} else {
							let influence = 1 - (d - attraction.innerRadius)/(attraction.radius - attraction.innerRadius)
							newScale += (attraction.zoom - this.getTrueScale()) * attraction.zoomPower * influence
							influence *= attraction.power
							newCamX += (x - this.x)*influence
							newCamY += (y - this.y)*influence
						}
						interest.getCameraAttractionObject().targetX = this.__getDisplayOffsetX()
						interest.getCameraAttractionObject().targetY = this.__getDisplayOffsetY()
						length++
					}
				}
			}
			attraction = null
		})
		if (length > 0) {
			this.lerpSmoothedX(dt, this.x + newCamX/length)
			this.lerpSmoothedY(dt, this.y + newCamY/length)
			this.lerpSmoothScale(dt, this.getTrueScale() + newScale/length)
			this.#lockY = false
			this.#lockX = false
		} else {
			this.lerpSmoothScale(dt, this.getTrueScale())
			if (this.#lockX) {this.#smoothedX = this.x} else {
				this.lerpSmoothedX(dt, this.x)
				if (Math.abs(this.x - this.#smoothedX) < this.#lockMargin) {
					this.#lockX = true
				}
			}
			if (this.#lockY) {this.#smoothedY = this.y} else {
				this.lerpSmoothedY(dt, this.y)
				if (Math.abs(this.y - this.#smoothedY) < this.#lockMargin) {
					this.#lockY = true
				}
			}
		}
	}
	lerpSmoothScale(dt, target) {this.#smoothScale += (target - this.#smoothScale)*this.#smoothScaleEase*dt}
	lerpSmoothedX(dt, target) {this.#smoothedX += (target - this.#smoothedX)*this.#smoothEase*dt}
	lerpSmoothedY(dt, target) {this.#smoothedY += (target - this.#smoothedY)*this.#smoothEase*dt}
	__getDisplayOffsetX() {return this.#smoothedX}
	__getDisplayOffsetY() {return this.#smoothedY}
	__getDisplayScale() {return this.#smoothScale + this.scaleOffset}

	trackTarget(target) {
		let dx = target.x - this.x
		let dy = target.y - this.y
		this.track.x = dx * this.ease.x
		this.track.y = dy * this.ease.y
	}

	setTarget(target) {
		if (this.#target) {this.#target.__stopBeingCameraTarget()}
		if (target == null) {
			this.#target = null
			this.#hasTarget = false
			return;
		}
		this.#target = target
		this.#target.__becomeCameraTarget(this)
		this.#hasTarget = true
	}

	destroy() {
		super.destroy()
		this.setTarget(null)
	}
}