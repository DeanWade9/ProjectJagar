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
  if (!data || typeof data !== 'object') {
    console.log('ops...', data)
    return
  }
  Object.keys(data).forEach((key) => {
    let value = data[key]
    const dep = new Dependency()
    Observer(value) // recursion -> hijack child property
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log(`get property ${key} -> ${value}`)
        Dependency.temp && dep.addSub(Dependency.temp)
        return value
      },
      set(newValue) {
        Observer(newValue)
        console.log(`set property ${key} -> ${newValue}`)
        value = newValue
        dep.notify()
      },
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
  while ((child = vm.$el.firstChild)) {
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
      const tempValue = node.nodeValue // 提前保存节点内容也就是包含插值表达式的字符串 否则65行代码替换修改了nodeValue以后watcher中的正侧将匹配不到任何内容
      const result_regex = pattern.exec(node.nodeValue)
      // console.log('node:', node)
      // console.log(node.nodeValue)
      // console.log(result_regex)
      if (result_regex) {
        // result_regex may be null
        console.log(vm.$data[result_regex[1]])
        // result_regex[1] may be more.info, so we need to reduce it!
        const value = result_regex[1]
          .split('.')
          .reduce((prev, cur) => prev[cur], vm.$data)
        // console.log('value:', value)
        // console.log('nodeValue old:', node.nodeValue)
        node.nodeValue = tempValue.replace(pattern, value)
        new Watcher(vm, result_regex[1], (newValue) => {
          node.nodeValue = tempValue.replace(pattern, newValue)
        })
        // console.log('nodeValue new:', node.nodeValue)
      }
      return // recursion needs an exit point
    }
    // 元素节点nodeType是1
    if (node.nodeType === 1 && node.nodeName === 'INPUT') {
      const attr = node.getAttribute('v-model')
      // const attr = node.attributes
      console.log(attr)
      const value = attr.split('.').reduce((prev, cur) => prev[cur], vm.$data)
      node.value = value // replace input element value with vm data
      new Watcher(vm, attr, (newValue) => {
        node.value = newValue // replace input element value with vm data
      })
      node.addEventListener('input', (e) => {
        console.log(e.target.value, attr)
        // 获取最里面的key
        const innerProp = attr.split('.')[attr.split('.').length - 1]
        // console.log(attr.split('.')[attr.split('.').length - 1])
        attr.split('.').reduce((prev, cur) => {
          // console.log('prev:', prev)
          // console.log('cur:', cur)
          // 匹配到最里层的key 就赋新值
          if (cur === innerProp) {
            prev[cur] = e.target.value
          } else {
            // 不是最里层的key 就进入下一层
            return prev[cur]
          }
        }, vm.$data)
      })
    }
    node.childNodes.forEach((child) => fragment_compile(child))
  }
  vm.$el.appendChild(fragment)
}

// collect and notify watchers(subscribers)
class Dependency {
  constructor() {
    this.subscribers = []
  }
  addSub(sub) {
    this.subscribers.push(sub)
  }
  notify() {
    this.subscribers.forEach((sub) => sub.update())
  }
}

// watcher
class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm
    this.key = key
    this.callback = callback
    Dependency.temp = this
    key.split('.').reduce((prev, cur) => prev[cur], vm.$data)
    Dependency.temp = null
  }
  update() {
    const value = this.key
      .split('.')
      .reduce((prev, cur) => prev[cur], this.vm.$data)
    this.callback(value)
  }
}
