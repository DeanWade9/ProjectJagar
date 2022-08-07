class jVue {
  constructor({ el: selector, data }) {
    this.$data = data
    this.$el = document.body.querySelector(selector)
    // observe data
    observe(this.$data)
    compile(this)
  }
}

function observe(data) {
  if (!data || typeof data !== 'object') {
    console.log('ignore:', data)
    return
  }
  Object.keys(data).forEach((key) => {
    const dep = new Dep()
    let value = data[key]
    observe(value)
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        console.log(`access property ${key}`)
        Dep.target && dep.add(Dep.target)
        return value
      },
      set(newValue) {
        if (newValue != value) {
          console.log(`set property ${key} with new value ${newValue}`)
          value = newValue
          dep.notify()
        }
      }
    })
  })
}

function compile(vm) {
  const el = vm.$el
  const data = vm.$data
  // console.log(el.firstChild)
  // console.log(el.childNodes)
  const fragment = document.createDocumentFragment()
  let child
  while ((child = el.firstChild)) {
    fragment.appendChild(child)
  }
  console.log(fragment)

  compileTemplate([...fragment.childNodes], vm)
  function compileTemplate(nodeList, vm) {
    const pattern = /\{\{\s*(\S+)\s*}\}/
    console.log(nodeList)
    nodeList.forEach((node) => {
      const tempContent = node.innerText
      if (node.nodeName === 'SPAN') {
        // console.log('tempContent:', tempContent)
        const matchedKey = pattern.exec(tempContent)[1]
        const matchedContent = pattern.exec(tempContent)[0]
        // console.log('tempContent:', tempContent)
        // console.log('matchedKey:', matchedKey)
        // console.log('matchedContent:', matchedContent)
        // console.log('node innerText:', node.innerText)
        // console.dir(node)
        const value = matchedKey
          .split('.')
          .reduce((prev, cur) => prev[cur], data)
        node.innerText = tempContent.replace(matchedContent, value)
        new Watcher(vm, matchedKey, (newValue) => {
          node.innerText = tempContent.replace(matchedContent, newValue)
        })
        // console.log('this:', vm)
      } else if (node.nodeName === 'INPUT') {
        console.log(node.getAttribute('j-model'))
        const matchedKey = node.getAttribute('j-model')
        const value = matchedKey
          .split('.')
          .reduce((prev, cur) => prev[cur], data)
        node.value = value
        new Watcher(vm, matchedKey, (newValue) => {
          node.value = newValue
        })
        // deal with input event on INPUT element
        node.addEventListener('input', (e) => {
          console.log(e.target.value)
          const matchedKeyList = node.getAttribute('j-model').split('.')
          const targetKey = matchedKeyList[matchedKeyList.length - 1]
          matchedKeyList.reduce((prev, cur) => {
            if (cur === targetKey) {
              console.log('prev:', prev)
              console.log('cur:', cur)
              prev[cur] = e.target.value
            } else {
              return prev[cur]
            }
          }, data)
          console.log('data:', data)
          console.log(targetKey, 11)
        })
      }
    })
  }
  document.body.appendChild(fragment)
}

// collect watcher
class Dep {
  constructor() {
    this.watcherlist = []
  }
  add(watcher) {
    this.watcherlist.push(watcher)
  }
  notify() {
    this.watcherlist.forEach((watcher) => {
      // TODO
      watcher.update()
    })
  }
}

class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm
    this.key = key
    this.callback = callback
    Dep.target = this
    this.key.split('.').reduce((prev, cur) => prev[cur], this.vm.$data) // trigger
    Dep.target = null
  }
  update() {
    const newValue = this.key
      .split('.')
      .reduce((prev, cur) => prev[cur], this.vm.$data)
    this.callback(newValue)
  }
}
