class Controls {
	#elements = []
	constructor() {
		this.keymap = {}
		this.key = {}
		this._keydownEvent = this._keydownEvent.bind(this)
		this._keyreleaseEvent = this._keyreleaseEvent.bind(this)
	}

	destroy() {
		this.#elements = null
	}

	registerKey(control, key) {this.keymap[control] = key}

	_keydownEvent(e) {this.key[e.key] = true}

	_keyreleaseEvent(e) {this.key[e.key] = false}

	getKey(key) {return this.key[key] || false}

	getControl(control, asInt=false) {
		return asInt ? (this.getKey(this.keymap[control]) ? 1 : 0) : this.getKey(this.keymap[control])
	}
	
	listen(element) {
		element.addEventListener("keydown", this._keydownEvent)
		element.addEventListener("keyup", this._keyreleaseEvent)
	}

	unlisten() {
		this.#elements.forEach(e => this.unlistenSingular(e))
		this.#elements = []
	}

	unlistenSingular(element) {
		element.removeEventListener("keydown", this._keydownEvent)
		element.removeEventListener("keyup", this._keyreleaseEvent)
	}
}