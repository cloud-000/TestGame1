class PhysicsRect extends Rect {
	#dummyRect=new Rect(0, 0, 0, 0)
	constructor(x, y, w, h) {
		super(x, y, w, h)
		this.tilemaps = []
		this.collisionDirections = []
		this.collisions = {top: false, bottom: false, left: false, right: false}
		this.gravityFactor = 0.6
		this.terminalVelocity = 20
		this.downFactor = 1.25 + 0.25
		this.deltaVelocity = {x: 0, y: 0, __lastX: 0, __lastY: 0, gravity: 0, gt: false}
	}
	destroy() {super.destroy(); this.tilemaps = null}
	addTilemap(t) {
		this.tilemaps.push(t)
		this.#setCollisionOffsets(t.tile * t.scale)
	}
	applyMovement(dt) {
		this.deltaVelocity.gravity = 0
		this.deltaVelocity.gt = false
		if (!this.collisions.bottom) {
			this.deltaVelocity.gravity = this.gravityFactor * (this.vy > 0 ? this.downFactor : 1) 
			this.vy += this.deltaVelocity.gravity * dt
			if (this.vy > this.terminalVelocity) {
				this.deltaVelocity.gravity = this.terminalVelocity - (this.vy - this.deltaVelocity.gravity*dt)
				this.deltaVelocity.gt = true
				this.vy = this.terminalVelocity
			}
		}
	}
	update(dt) {
		this.applyMovement(dt)
		this.checkCollisions(dt)
		this.deltaVelocity.x = this.vx - this.deltaVelocity.__lastX
		this.deltaVelocity.y = this.vy - this.deltaVelocity.__lastY
		this.deltaVelocity.__lastX = this.vx
		this.deltaVelocity.__lastY = this.vy
	}
	isGrounded() { return this.collisions.bottom }
	checkCollisions(dt) {
        this.x += this.vx * dt
		this.collisions.left = false
		this.collisions.right = false
		for (let i = this.tilemaps.length - 1; i >= 0; i--) {
			let c = this.checkCollisionsX(this.tilemaps[i])
			Object.keys(c).forEach(direction => {
				if (c[direction]) {
					this.collisions[direction] = true
				}
			})
		}
		this.y += this.vy * dt
		this.collisions.top = false
		this.collisions.bottom = false
		for (let i = this.tilemaps.length - 1; i >= 0; i--) {
			let c = this.checkCollisionsY(this.tilemaps[i])
			Object.keys(c).forEach(direction => {
				if (c[direction]) {
					this.collisions[direction] = true
				}
			})
		}		
	}
	checkCollisionsX(tilemap) {
		let collisions = {left: false, right: false}
		for (const r of this.collision(tilemap)) {
			if (this.vx > 0) {
				this.vx = 0;
				this.right = r.left
				collisions.right = 0
			} else if (this.vx < 0) {
				this.vx = 0;
				this.left = r.right
				collisions.left = true
			}
		}
		return collisions
	}
	checkCollisionsY(tilemap) {
		let collisions = {top: false, bottom: false}
		for (const r of this.collision(tilemap)) {
			if (this.vy > 0) {
				this.bottom = r.top
				this.vy = 0
				collisions.bottom = true
			} else if (this.vy < 0) {
				this.top = r.bottom
				this.vy = 0
				collisions.top = true
			}
		}
		return collisions
	}
	collision(tilemap) {
        let m = tilemap.tile * tilemap.scale;let xP = Math.floor(this.x/m);let yP = Math.floor(this.y/m);let r = []
		this.#dummyRect.width = m
		this.#dummyRect.height = m
		for (const offset of this.collisionDirections) {
            let t = tilemap.getTile(xP + offset[0] , yP + offset[1])
            if (t) {if (tilemap.getSolid(t.type)) {
					this.#dummyRect.x = t.x*m
					this.#dummyRect.y = t.y*m
                    if (this.colliderect(t.hasRect ? t.rect : this.#dummyRect)) {
                        r.push(t.hasRect ? t.rect.copy() : this.#dummyRect)
					}
				}
            }
        }; xP = null;yP = null;m = null;return r
    }

    #setCollisionOffsets(tile) {
        let widthTiles = Math.ceil(this.width/tile)
        let heightTiles = Math.ceil(this.height/tile)
        this.collisionDirections = TileGen.fullFill(0, (widthTiles * 2 + 1)*(heightTiles*2 + 1))
        let i = 0
        for (let x = 0; x < widthTiles * 2 + 1; ++x) {
            for (let y = 0; y < heightTiles * 2 + 1; ++y) { 
				this.collisionDirections[i] = [x - widthTiles, y - heightTiles]; i++
            }
        }; i = null;widthTiles = null;heightTiles = null 
    }
}