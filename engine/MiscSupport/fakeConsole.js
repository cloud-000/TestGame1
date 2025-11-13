
function createScript(script) {return UI.element("script", {type: "text/javascript"}, {text: script})}
function createStyle(style) {return UI.element("style", {}, {rel: "stylesheet", textContent: style})}

class fakeConsole {
	static {
		onbeforeunload = fakeConsole.beforeClose.bind(Main)
	}
    static log(message) {
        if (!this.console) { return; }
		let d = UI.element("div", {style: "width: 100%; display: flex; flex-direction: row; align-items: center; justify-content: space-between;", class: "message"})
        d.appendChild(UI.element("span", {}, {textContent: message}))
        let e = new Error();Error.captureStackTrace(e);let f = e.stack.split("\n")
		d.appendChild(UI.element("span", {style: "font-size: 1rem; opacity: .5"}, {textContent: `line:${ (f[2].match(/(:[\d]+)/)[0].replace(":","")) }` }))
    	let contain = this.console.document.querySelector(".messages")
		contain.scrollTo(0, contain.scrollHeight + 10);
		contain.appendChild(d)
    }

    static beforeClose(e) {
        if (fakeConsole.console) {fakeConsole.console.close()}
    }

    static createDebugConsole(popup=true) {
		if (this.console) {throw new Error("Already has debug console")}
        this.console = open("about:blank", "_blank", !popup ? null : `popup,width=${window.innerWidth*.25},height=${window.innerHeight*.75},left=${ window.screenLeft + window.innerWidth*.75},top=${window.screenTop + window.innerHeight*.25}`)
        let script = 'function main() {console.log("Debuggin the debugger be like")}; main()'
        let style = 
`
@import url("https://fonts.googleapis.com/css?family=Roboto")
body, html { margin: 0; padding: 0; }
body { width: 100vw; height: 100vh; box-sizing: border-box; padding: 0; margin: 0;
    background-color: white;
	overflow: hidden;
}
.messages {width: 100%;height: 100%;box-sizing: border-box;padding: .5rem;overflow-y: auto;}
.message {font-family: Roboto, sans-serif, arial;font-size: 1.5rem;color: black}`
        let html = "<!DOCTYPE html><html><head><title>Debug panel</title></head><body><div class='messages'></div></body></html>"
		this.console.document.open()
        this.console.document.write(html.replace(/(\r\n|\n|\r)/gm, ""))
        this.console.document.close()
		this.console.document.body.appendChild(createScript(script))
		this.console.document.head.appendChild(createStyle(style))
	}
}