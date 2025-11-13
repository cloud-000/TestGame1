class StateManager {
	#currentState = null
	#currentStateKey = null
	constructor() {
		this.states = {}
	}

	destroy() {
		this.state = null
		Object.keys(this.states).forEach(k => {
			this.states[k].destroy()
			delete this.states[k]
		})
		this.states = null
		this.#currentState = null
		this.#currentStateKey = null
	}

	async addState(key, state) { 
		this.states[key] = state
		await state.setParent(this)
	}

	removeState(key) { delete this.states[key] }

	set state(key) {
		if (key === this.#currentStateKey) {
			return; // same state
		}
		if (this.#currentState != null) {
			this.#currentState.exit()
		}
		if (key != null) {
			this.#currentState = this.states[key]
			this.#currentState.enter()
		}
		this.#currentStateKey = key
	}

	get state() { return this.#currentState }

	get stateKey() { return this.#currentStateKey }

	triggerEvent(type) { if (this.#currentStateKey != null) { this.#currentState.onEventTrigger(type) } }
}

class State {
	constructor() {
		this.stateValues = {
			parent: null,
			active: false,
		}
	}

	setParent(p) { this.stateValues.parent = p }

	onEventTrigger(type) {}

	destroy() {
		Object.keys(this.stateValues).forEach(k => delete this.stateValues[k])
		this.stateValues = null
	}

	enter() { this.stateValues.active = true }

	exit() { this.stateValues.active = false }
}

class GState extends State { frame(dt) {} draw() {}}

class GStateManager extends StateManager { frame(dt) { if (this.stateKey) { this.state.frame(dt) } } draw(dt) { if (this.stateKey) { this.state.draw(dt) } }}