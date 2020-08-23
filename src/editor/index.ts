import '../../assets/fonts/fontawesome-free-5.14.0-web/css/all.css'
import './editor.css'
import Vue from 'vue'
import Editor from './components/Editor.vue'
import EditorClient from './network/EditorClient'
import EditorState from './EditorState'
import Logger from '../client/util/Logger'
;(window as any).log = new Logger()

const font = document.createElement('link')
font.href = 'https://fonts.googleapis.com/css2?family=Lato&display=swap'
font.rel = 'stylesheet'
document.head.append(font)

const el = document.createElement('div')
document.body.appendChild(el)

let state = new EditorState()
let client = new EditorClient(state)

client.start()

let mixin = Vue.observable({
  state,
  client,
})

if (module.hot) {
  module.hot.accept(['./EditorState', './network/EditorClient'], () => {
    log.info('Develop', 'Reload editor state')

    client.stop()
    state.destroy()

    state = new EditorState()
    client = new EditorClient(state)

    client.start()

    mixin.state = state
    mixin.client = client
  })
}

Vue.mixin({
  computed: {
    $state() {
      return mixin.state
    },
  },
})

async function init() {
  await new Promise(resolve => {
    client.onConnect.observe(() => {
      resolve()
    })
  })

  new Vue({
    el,
    render: f => f(Editor),
  })
}

init()
