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

const mixin = Vue.observable({
  state: new EditorState(),
})

if (module.hot) {
  module.hot.accept('./EditorState', () => {
    mixin.state = Vue.observable(new EditorState())
  })
}

const client = new EditorClient(mixin.state)
client.start()

Vue.mixin({
  computed: {
    $state() {
      return mixin.state
    },
  },
})

new Vue({
  el,
  render: f => f(Editor),
})
