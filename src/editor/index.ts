import './editor.css'
import Vue from 'vue'
import Editor from './components/Editor.vue'
import EditorState from './EditorState'

const el = document.createElement('div')
document.body.appendChild(el)

Vue.prototype.$state = new EditorState()

new Vue({
  el,
  render: f => f(Editor),
})
