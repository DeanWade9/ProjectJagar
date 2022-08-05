class DVue {
  constructor(obj) {
    this.$data = obj.data
    Observer(this.$data) // monitor data change
    Compile(obj.el, this)
  }
}

// data hijack
function Observer(data) {
  // if child property is {} or null or undefined OR child property is basic type then end recursion
  if(!data || typeof data !== 'object') {
    console.log('ops...', data)
    return
  }
  Object.keys(data).forEach(key => {
    let value = data[key]
    Observer(value) // recursion -> hijack child property
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log(`get property ${key} -> ${value}`)
        return value
      },
      set(newValue) {
        Observer(newValue)
        console.log(`set property ${key} -> ${newValue}`)
        value = newValue
      }
    })
  })
}

// template compile - replace DOM with vm data
function Compile(element, vm) {
  vm.$el = document.querySelector(element)
  // to prevent frequently manipulate DOM
  const fragment = document.createDocumentFragment()
  // console.log(vm.$el.childNodes)
  let child
  // add each child into internal memory
  while(child = vm.$el.firstChild) {
    fragment.append(child)
  }
  console.log(fragment)
  console.log(fragment.childNodes)
  fragment_compile(fragment)
  // replace fragments content - nodeType=3
  function fragment_compile(node) {
    const pattern = /\{\{\s*(\S+)\s*\}\}/
    // we only need to find and replace text nodes!
    if (node.nodeType === 3) {
      const result_regex = pattern.exec(node.nodeValue)
      // console.log('node:', node)
      // console.log(node.nodeValue)
      // console.log(result_regex)
      if(result_regex) { // result_regex may be null
        console.log(vm.$data[result_regex[1]])
        // result_regex[1] may be more.info, so we need to reduce it!
        const value = result_regex[1].split('.').reduce((prev, cur) => prev[cur], vm.$data)
        // console.log('value:', value)
        // console.log('nodeValue old:', node.nodeValue)
        node.nodeValue = node.nodeValue.replace(pattern, value)
        // console.log('nodeValue new:', node.nodeValue)
      }
      return // recursion needs an exit point
    }
    node.childNodes.forEach(child => fragment_compile(child))
  }
  vm.$el.appendChild(fragment)
}