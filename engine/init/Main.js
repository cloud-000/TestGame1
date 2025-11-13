class Main {
	constructor() {
		this.canvas = document.querySelector("canvas")
		this.context = this.canvas.getContext("2d")
		this.ratio = {width: 1, height: 1}
		this.canvas_size = 70*devicePixelRatio
		this.canvasScale = 1
		this.targetFps = 30
		this.maxFrameTime = 250
		this.deltaTime = -1
		this.game = new Game(this)
	}

	cancelSmoothing(bool=false) {
        this.context.mozImageSmoothingEnabled = bool;
        this.context.webkitImageSmoothingEnabled = bool;
        this.context.msImageSmoothingEnabled = bool;
        this.context.imageSmoothingEnabled = bool
	}

	frame(dt) {
		this.game.frame(dt * this.deltaTime)
	}

	draw() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.game.draw()
	}

	start({fps}) {
		window.addEventListener("resize", this.resize.bind(this))
		document.addEventListener("visibilitychange", this.toggleTab.bind(this))	
		this.targetFps = fps
		this.deltaTime = this.targetFps/1000
		this.game.start()
		let last = 0
		let frameTime = 0
		let accumulator = 0.0
		let dt = 16
		const loop = (now) => {
			frameTime = now - last
			if (frameTime > this.maxFrameTime) {frameTime = this.maxFrameTime}
			last = now
			accumulator += frameTime
			// FIX DRAW
			while (accumulator >= dt) {
				this.frame(dt)
				accumulator -= dt
			}
			this.draw()
			requestAnimationFrame(loop)
		}
		loop(0)
	}

	initCanvas(w, h) {
		this.ratio.width = w
		this.ratio.height = h
		this._changeCanvasSize()
	}

    initGame() {this.game.init()}

	_changeCanvasSize() {
		this.canvas.width = this.ratio.width * this.canvas_size
		this.canvas.height = this.ratio.height * this.canvas_size
	}

	toggleTab() {if (document.visibilityState == "visible") { this.game.unpause() } else { this.game.pause() }}

	resize() {
        let ratio = this.ratio
		if (window.innerWidth > window.innerHeight){
            this.canvas.style.height = window.innerHeight + "px";
            this.canvas.style.width = (this.canvas.offsetHeight * ratio.width/ratio.height) + "px";
            if (this.canvas.offsetWidth > window.innerWidth){
                this.canvas.style.height = (window.innerWidth * .01 / ratio.width * ratio.height * 100) + "px";
                this.canvas.style.width  = (this.canvas.offsetHeight * ratio.width / ratio.height) + "px";
            }
        } else {
            this.canvas.style.width = window.innerWidth + "px";
            this.canvas.style.height = (this.canvas.offsetWidth * ratio.height/ratio.width) + "px";
        }
        this.canvasScale = this.canvas.offsetWidth / this.canvas.width
	}
}