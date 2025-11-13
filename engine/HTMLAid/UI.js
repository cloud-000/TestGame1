class UI{
  static c={};
  static l={};
  // ex: UI.element("div", {style: "background-color: green; font-size: 50px;"}, {textContent: "Hello World?"})
  static element(t,s={},r={}) {
    let i=document.createElement(t);
    return UI.setAttributes(i,s),UI.setOtherAttrs(i,r),i
  }
  // HTML attributes
  // ex: UI.setAttributes(HTMLelement, {style: "color: red;"})
  static setAttributes(t,s) {
    Object.keys(s).forEach(r=>t.setAttribute(r,s[r]))
  }
  // JS attributes
  static setOtherAttrs(t,s) {
    Object.keys(s).forEach(r=>t[r]=s[r])
  }
  // Generate HTML from raw HTML strings
  static html(t) {
    let s=UI.element("div");return s.innerHTML=t,s.firstChild
  }
}

// Create Component
UI.component = (name) => {return UI.compose(UI.c[name])}

// Register Component (Children supported and will be cloned). ex: UI.register("my-cool-component-yeah", htmlElement)
UI.register = (name, element) => {UI.c[name] = UI.decompose(element)}

// Helper functions
UI.decompose = (e) => {
  if (e.children.length == 0) {return {element: e.cloneNode(), childs: false, text: e.textContent}}
  return {element: e.cloneNode(), childs: Array.from(e.children).map((c) => {return UI.decompose(c)})}
}
UI.compose = (l) => {
  let e = l.element.cloneNode()
  if (l.text) {e.textContent = l.text}
  if (l.childs) {l.childs.forEach(c => e.appendChild(UI.compose(c)))}
  return e
}