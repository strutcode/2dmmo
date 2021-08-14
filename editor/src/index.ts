import Vue from 'vue'

import './style/global.scss'
import Editor from './ui/Editor.vue'

new Vue({
  el: document.getElementById('app') as HTMLDivElement,
  render: (h) => h(Editor),
})
