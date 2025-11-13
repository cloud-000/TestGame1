class Spritesheet {
	static canvas = document.createElement("canvas"); static c = this.canvas.getContext("2d")
	#reversedImage = null
	#hasReversed = false
    constructor(src) {
        this.image = new Image()
        this.image.src = src
        this.image.crossOrigin = "anonymous"
        this.loaded = false
		this.decoded = false
        this.image.onload = () => { this.loaded = true }
    }
	get reversed() {return this.#reversedImage}
	get hasReversed() {return this.#hasReversed}
    static getPixelColor(canvas, image, x, y) {canvas.width = 1;canvas.height = 1;canvas.context.clearRect(0, 0, canvas.width, canvas.height);canvas.context.drawImage(image, x, y, 1, 1, 0, 0, 1, 1);return canvas.context.getImageData(0, 0, 1, 1)}
    async load() {await this.image.decode(); this.decoded = true}
	static __clearCanvas() {Spritesheet.c.clearRect(0, 0, Spritesheet.canvas.width, Spritesheet.canvas.height)}
	static flip(image, clipColor="255, 255, 255") {
		Spritesheet.__clearCanvas()
		Spritesheet.canvas.width = image.width
		Spritesheet.canvas.height = image.height
		Spritesheet.c.save()
		Spritesheet.c.scale(-1, 1)
		Spritesheet.c.translate(-image.width + 1, 0)
		Spritesheet.c.drawImage(image, 0, 0)
		Spritesheet.c.restore()
		Spritesheet.c.clearRect(0, 0, 1, 1)
		Spritesheet.c.fillStyle = "rgb(" + clipColor + ")"
		Spritesheet.c.fillRect(image.width - 1, 0, 1, 1)
		let i = new Image()
		i.src = Spritesheet.canvas.toDataURL()
		Spritesheet.c.resetTransform()
		return i
	}
	async reversedImages(clipColor="255, 255, 255") {
		let flipped = await Spritesheet.flip(this.image, clipColor) 
		let i = this.images(clipColor, true, flipped)
		this.#reversedImage = i.image
		this.#hasReversed = true
		return i.images
	}
    images(clipColor="255, 255, 255", reversed=false, ri=null) {
		let images = [];
		let canvas = document.createElement("canvas");canvas.context = canvas.getContext("2d", { willReadFrequently: true});let color = clipColor.split(",").map(str => { return parseInt(str) }); let clipStart = 0;let clipWidth = 0;
		let image = reversed ? ri : this.image
		canvas.width = image.width
		canvas.height = image.height
		canvas.context.drawImage(image, 0, 0)
		for (let i = 0; i < image.width; ++i) {
            // let currentColor = Spritesheet.getPixelColor(canvas, image, i, 0).data
			let currentColor = canvas.context.getImageData(i, 0, 1, 1).data
            let equals = true
            if (currentColor[3] == 0) {
                equals = false
            } else {
                eqLoop: for (let i = 0; i < color.length; ++i) {
                    if (color[i] != currentColor[i]) {
                        equals = false
                        break eqLoop;
                    }
                }
            }
            if (equals) { images.push({x: clipStart, y: 0, width: clipWidth, height: this.image.height}); clipStart = i + 1; clipWidth = 0; } else { clipWidth ++}
        };
		delete canvas.context; canvas = null; color = null; return reversed ? {images: images, image: image} : images
    }
}