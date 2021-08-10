import Vue from 'vue'
import Client from './network/Client'

import Editor from './ui/Editor.vue'

new Client()

new Vue({
  el: document.getElementById('app') as HTMLDivElement,
  render: (h) => h(Editor),
})
