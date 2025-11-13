class Game {
	#hiddenDelta = 1
	#paused = false
    #statesTBA = {}
	constructor(main) {
		this.main = main
		this.manager = new GStateManager()
		this.manager.main = this
	}

	async init() {
		/*await this.manager.addState("test1", new (class extends GState {
			constructor() {
				super()
				this.scene = new Scene2d()
				this.tilemap = new TileMap()
				this.tilemap.scale = 2
				this.tilemap.tile = 16
				this.scene.camera.scale = 1;

				let obj = new Player(0, -500, (16-2)*2.5, 12*2.5)
				obj.vy = 0
				this.scene.addChildById(obj, "player")
				this.scene.camera.setTarget(this.scene.getChildById("player"))
				obj.controls.listen(window)
				obj = null

				let testy = new Object2d()
				testy.x = 500
				testy.y = -110
				this.scene.addChild(testy)
				this.scene.camera.addPointOfInterest(testy)
			
				this.scene.camera.debug = true
			}

			enter() {
				super.enter()
			}

			async setParent(p) {
				super.setParent(p)
				this.scene.camera.setDimensions(p.main.main.canvas.width, p.main.main.canvas.height)

                let sheet1 = new Spritesheet(__CONFIG.BASIC.tile1)
				await sheet1.load()
				this.tilemap.addType("grass", new TileSorter(sheet1, null, "0, 0, 0", {"0010": 0, "0011": 0, "0110": 0, "0111": 0}, 1))
				TileGen.lodFromFill(this.tilemap, TileGen.fullFill(150, 30), "grass")
				this.tilemap.resize(this.stateValues.parent.main.main.canvas)
				this.tilemap.autoMap()
				this.scene.getChildById("player").addTilemap(this.tilemap)

				let playerSheet = new Spritesheet(__CONFIG.BASIC.player)
				let idle = new __BasicSpriteAnimation()
				await idle.load(playerSheet, true)

				let animation = new SpriteAnimation()
				await animation.addAnimation("idle", idle)
				animation.state = "idle"
				this.scene.getChildById("player").attachAnimation(animation)
			}

			frame(dt) {
				this.scene.update(dt)
			}

			draw() {
				this.tilemap.draw(this.stateValues.parent.main.main.context, this.scene.camera)
				this.scene.draw(this.stateValues.parent.main.main.context)
			}

		})() )*/
        for (let [name, state] of Object.entries(this.#statesTBA)) {
            await this.manager.addState(name, state)
        }
        this.#statesTBA = null
		// this.manager.state = "test1"
	}

    setState(name) {this.manager.state = name}

	start() {}

	frame(dt) {this.#trueFrame(dt)}

	draw() {
		this.main.context.fillStyle = __CONFIG.BASIC.COLORS.BACKGROUND[0]
		this.main.context.fillRect(0, 0, this.main.canvas.width, this.main.canvas.height)
		this.main.context.fillStyle = __CONFIG.BASIC.COLORS.PRIMARY[2]
		this.manager.draw()
	}

	pause() {
		this.#paused = true
		// this.manager.state = null
		this.#hiddenDelta = 0
		this.frame = () => {}
	}

	unpause() {
		this.#paused = false
		setTimeout(() => {
			if (document.visibilityState == "visible") {
				this.#hiddenDelta = 1
				this.frame = (dt) => {this.#trueFrame(dt)}
			}
		}, 100);
		// this.manager.state = "test1"
	}

	#trueFrame(dt) {
		let delta = roundToNearestMultiple(dt, 0.05)*this.#hiddenDelta
		this.manager.frame(delta)
	}

    // call before init
    addState(name, state) {this.#statesTBA[name] = state}
}