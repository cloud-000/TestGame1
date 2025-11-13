// https://lospec.com/palette-list/pelennor8
function main() {
	devicePixelRatio = Math.floor(devicePixelRatio)
	const MAIN = new Main()
	MAIN.game.addState("test1", new (
class extends GState {
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

}
	)())
	MAIN.initCanvas(16, 9)
	MAIN.cancelSmoothing()
	MAIN.resize()
	MAIN.initGame()
	MAIN.start({fps: 60})
	MAIN.game.setState("test1")
}


class TileGen {
    static fullFill(w, h, num=0) {
        let arr = []
        for (let i = 0; i < h; ++i) {let subArr = []; for (let k = 0; k < w; ++k) {subArr.push(num)};arr.push(subArr)};return arr
    }
    static randomize(arr) {
        for (let y = 0; y < arr.length; ++y) {
            for (let x = 0; x < arr[y].length; ++x) {
                // arr[y][x] = randint(0)
            }
        }
	    return arr
	}
    static lodFromFill(tilemap, arr, type='stone', num=0, offset=[0, 0]) {for (let y = 0; y < arr.length; ++y) {for (let x = 0; x < arr[y].length; ++x) {if (arr[y][x] == num) {tilemap.setTile(x+offset[0], y+offset[1], type)}}}}
    static setRect(arr, x_, y_, w, h, r=1) {for (let y = 0; y < h; ++y) { for (let x = 0; x < w; ++x) {if (typeof arr[y + y_][x+x_] !== "undefined") {arr[y + y_][x+x_] = r}}}}
}



// --- end of utils ---
class Player extends PhysicsRect {
	constructor(x, y, w, h) {
		super(x, y, w, h)
		this.controls = new Movement2dControls()
		this.direction = 1
		this.movement = {
			acceleration: 0.5*0.5,
			friction: 0.4*0.6,
			max: 6,
			jumpHeight: 50,
			jumpInterval: 0.08,
			jumpCount: 0,
			jumpCountStarted: false,
			jumpFallEase: 0.5,
			co: { // camera offset
				x: 0,
				y: 0,
				stepX: 0.05,
				stepY: 0.1,
			}
		}
	}

	applyMovement(dt) {
		super.applyMovement(dt)
		let x = this.controls.axisX()
		let y = this.controls.axisY()
		// this.__parentCamera().offsetX = this.movement.co.x * this.width * 5
		if (x == 0) {
			let sign = Math.sign(this.vx)
			if (Math.abs(this.vx) > this.movement.friction) {
				this.vx -= this.movement.friction * sign
			} else {
				this.vx = 0
			}
			if (Math.abs(this.movement.co.x) > this.movement.co.stepX) {
				this.movement.co.x -= dt * this.movement.co.stepX * Math.sign(this.movement.co.x)
			} else {
				this.movement.co.x = 0
			}
		} else {
			this.direction = x
			this.movement.co.x += this.movement.co.stepX * x * dt
			this.movement.co.x = normalClamp(this.movement.co.x, 1, -1)
			if (this.vx * x < this.movement.max) {
				this.vx += this.movement.acceleration * x * dt
			} else {
				this.vx = this.movement.max * x
			}
		}
		if (y <= 0) {
			if (this.movement.jumpCountStarted) {
				this.__haltJump(dt)
			}
			this.movement.jumpCount = 0
		} else {
			if (this.isGrounded()) {
				this.movement.jumpCount = 0
				this.movement.jumpCountStarted = true
			}
			if (this.movement.jumpCountStarted) {
				this.movement.jumpCount = this.movement.jumpCount + this.movement.jumpInterval*dt
				if (this.movement.jumpCount < 1) {
					this.vy = -this.movement.jumpInterval*this.movement.jumpHeight - this.deltaVelocity.gravity
				} else {
					this.movement.jumpCount = 1
					this.__haltJump(dt)
				}
			}
		}
	}

	__haltJump(dt) {
		this.movement.jumpCountStarted = false
		if (this.vy < 0) {
			this.vy *= this.movement.jumpFallEase
		}
	}

	update(dt) {
		super.update(dt)
		this.updateAnimation(dt)
	}

	draw(context, camera) {
		this.drawAnimation(context, camera, this.width*0.5, this.height, true, 2.5, (this.direction == -1))
	}

	debugDraw(context, camera) {
		super.debugDraw(context, camera)
		super.draw(context, camera)
	}
}

window.onload = () => main()
