import '../../assets/fonts/fontawesome-free-5.14.0-web/css/all.css'
import './editor.css'
import Vue from 'vue'
import Editor from './components/Editor.vue'
import EditorState from './EditorState'

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
