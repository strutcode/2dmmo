import Vue from 'vue'
import NetworkSync from '../common/NetworkSync'
import ServerControl from './ServerControl.vue'
import FakeSocket from '../common/FakeSocket'
import User from './User'
import ClientView from './ClientView'

export default class Server {
  private vue: Vue
  private views: ClientView[] = []

  constructor() {
    console.log('start server')

    NetworkSync.onAdd((type, id, props) => {
      console.log('add', type, id, props)

      this.views.forEach(view => {
        if (view.has(id) && view.socket.onClientAdd) {
          view.socket.onClientAdd(type, id, props)
        }
      })
      // NetworkView.add(type, id, props)
    })
    NetworkSync.onUpdate((type, id, prop, value) => {
      console.log('update', type, id, prop, value)

      this.views.forEach(view => {
        if (view.has(id) && view.socket.onClientUpdate) {
          view.socket.onClientUpdate(type, id, {
            [prop]: value,
          })
        }
      })

      // NetworkView.update(type, id, prop, value)
    })

    FakeSocket.onConnection(socket => {
      console.log('client connected')

      const view = new ClientView(socket)
      this.views.push(view)
      view.add(new User())
    })

    const el = document.createElement('div')
    document.body.appendChild(el)

    this.vue = new Vue({
      el,
      render: h => h(ServerControl),
    })
  }

  public destroy() {
    this.vue.$el.remove()
    this.vue.$destroy()
  }
}
