class __BasicSpriteAnimation extends State {
	#images = []; #baseImage = null; #hasImage = false; #time = 0; #flippedImage = null
	static canvas = document.createElement("canvas"); static c = this.canvas.getContext("2d")
	constructor() {super(); this.frame=0; this.defaultTime=8;}
	async load(sheet, flip=false, clipColor="255, 255, 255",) {
		if (!sheet.decoded) {
			await sheet.load()
		}
		this.setBaseImage(sheet.image)
		this.addImages(sheet.images(clipColor))
		if (flip) {
			this.setFlippedFrames(await sheet.reversedImages(clipColor))
			this.setFlippedImage(sheet.reversed)
		}
	}
	setBaseImage(image) {this.#hasImage=true;this.#baseImage=image}
	setFlippedFrames(images) {
		for(let i = 0; i < images.length; ++i) {
			this.#images[i].setFlippedRect(images[i])
		}
	}
	getBaseImage() {return this.#baseImage} getFlippedImage() {return this.#flippedImage}
	setFlippedImage(image) {this.#flippedImage = image}
	addImages(images) {images.forEach(i => this.#images.push(new __SpriteAnimationFrame(this, i)));}
	destroy() {super.destroy(); this.#images.forEach(i => i.destroy()); this.#images=null;this.#baseImage=null}
	getFrame(i) {return this.#images[i]}
	setFrame(i) {this.frame=Math.max(Math.min(i, this.#images.length), 0)}
	nextFrame(){this.setFrame((this.frame + 1)%this.#images.length)}
	update(dt) {
		this.#time += dt
		let t = this.getFrame(this.frame).length || this.defaultTime
		if (this.#time >= t) {
			this.#time = 0
			this.nextFrame()
		}
	}
	draw(context, x, y, scale, frame=this.frame, center=true, os=1, reverse=false) {this.getFrame(frame).draw(context, x, y, scale, center, os, reverse)}
	enter(reset=true) {
		super.enter()
		if (reset) {this.frame = 0}
	}
}

class __SpriteAnimationFrame {
	constructor(animation, rect) {
		this.animation = animation
		this.length = null
		this.rect = rect
		this.__flippedRect = null
	}
	setFlippedRect(rect) {this.__flippedRect = rect}
	draw(context, x, y, scale, center, os, flip=false) {
		let dw = this.rect.width*scale*os
		let dh = this.rect.height*scale*os
		let image;
		let rect;
		if (flip) {
			image = this.animation.getFlippedImage()
			rect = this.__flippedRect
		} else {
			image = this.animation.getBaseImage()
			rect = this.rect
		}
		context.drawImage(image, rect.x, rect.y, rect.width, rect.height, 
		x + (center ? -dw*0.5 : 0), y + (center ? -dh : 0), dw, dh
		)
	}
	destroy() {this.animation = null; this.rect = null}
}

class SpriteAnimation extends StateManager {

	update(dt) {if (this.stateKey) {this.state.update(dt)}}

	draw(context, x, y, scale, frame, center=true, os=1, flip=false) {if (this.stateKey) { if (!frame) {frame = this.state.frame}; this.state.draw(context, x, y, scale, frame, center, os, flip) }}

	async addAnimation(name, animation) {await this.addState(name, animation)}
}