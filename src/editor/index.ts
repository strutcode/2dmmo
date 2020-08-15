import './editor.css'
import Vue from 'vue'
import Editor from './components/Editor.vue'

const el = document.createElement('div')
document.body.appendChild(el)

new Vue({
  el,
  render: f => f(Editor),
})
