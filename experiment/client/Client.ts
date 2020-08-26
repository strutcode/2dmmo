import Vue from 'vue'
import FakeSocket from '../common/FakeSocket'
import ClientDisplay from './ClientDisplay.vue'
import NetworkView from './NetworkView'

export default class Client {
  private vue: Vue

  constructor() {
    console.log('start client')

    const el = document.createElement('div')
    document.body.appendChild(el)

    this.vue = new Vue({
      el,
      render: h => h(ClientDisplay),
    })
  }

  public destroy() {
    this.vue.$el.remove()
    this.vue.$destroy()
  }
}
