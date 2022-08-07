class DeanVue {
  constructor({ el: selector, data }) {
    this.$el = document.querySelector(selector)
    this.$data = data
    this.observe(data)
    this.compile(this)
  }

  observe(data) {
    if (!data || typeof data !== 'object') return
    Object.keys(data).forEach((key) => {
      const dep = new Dep()
      let value = data[key]
      this.observe(value)
      Object.defineProperty(data, key, {
        configurable: true,
        enumerable: true,
        get() {
          console.log(`trigger get -> property ${key}`)
          Dep.target && dep.add(Dep.target)
          return value
        },
        set(newValue) {
          console.log(`trigger set -> property ${key}`)
          if (value == newValue) {
            return
          } else {
            value = newValue
            dep.notify()
          }
        }
      })
    })
  }

  compile(vm) {
    const fragment = document.createDocumentFragment()
    // console.dir(vm.$el.children)
    Array.from(vm.$el.children).forEach((child) => {
      fragment.append(child)
    })
    console.dir(fragment)
    this.compileTemplate(fragment.childNodes, vm)

    document.body.appendChild(fragment)
  }

  compileTemplate(nodelist, vm) {
    const pattern = /\{\{\s*(\S+)\s*\}\}/
    console.log(nodelist)
    nodelist.forEach((node) => {
      // console.dir(node)
      if (node.nodeName === 'SPAN') {
        const nodeInnerText = node.innerText
        const matchedKeys = pattern.exec(node.innerText)[1]
        // replace {{ xxx }} with data using matchedKeys
        const value = matchedKeys
          .split('.')
          .reduce((prev, cur) => prev[cur], vm.$data)
        node.innerText = nodeInnerText.replace(pattern, value)
        // add watcher -> data => view(span) callback保存的是修改视图的方法
        new Watcher(vm, matchedKeys, (newValue) => {
          node.innerText = nodeInnerText.replace(pattern, newValue)
        })
      } else if (node.nodeName === 'INPUT') {
        const command = node.getAttribute('d-model')
        console.log('command:', command)
        // replace value property of input element with data using matchedKeys
        const value = command
          .split('.')
          .reduce((prev, cur) => prev[cur], vm.$data)
        node.value = value
        // add watcher -> data => view(input value) callback保存的是修改视图的方法
        new Watcher(vm, command, (newValue) => {
          node.value = newValue
        })
        // listen input event to realize view => data
        node.addEventListener('input', (e) => {
          const curValue = e.target.value
          const targetProp = command.split('.')[command.split('.').length - 1]
          command.split('.').reduce((prev, cur) => {
            if (cur === targetProp) {
              prev[cur] = curValue
              // console.log(cur, prev)
              return
            } else {
              return prev[cur]
            }
          }, vm.$data)
        })
      }
    })
  }
}

class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm
    this.key = key
    this.callback = callback
    Dep.target = this
    // trigger get
    this.key.split('.').reduce((prev, cur) => prev[cur], vm.$data)
    Dep.target = null
  }
  update() {
    console.log('update')
    const newValue = this.key
      .split('.')
      .reduce((prev, cur) => prev[cur], vm.$data)
    this.callback(newValue)
  }
}

class Dep {
  constructor() {
    this.watcherlist = []
  }
  add(watcher) {
    this.watcherlist.push(watcher)
  }
  notify() {
    this.watcherlist.forEach((watcher) => watcher.update())
  }
}
