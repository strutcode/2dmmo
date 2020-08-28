import FakeSocket from '../common/FakeSocket'
import ServerControl from './ServerControl.vue'
import ServerView from '../common/ServerView'
import User from './User'
import Vue from 'vue'

export default class Server {
  private vue: Vue
  private clients: User[] = []

  constructor() {
    console.log('start server')

    FakeSocket.onConnection(socket => {
      console.log('client connected')

      const view = new ServerView(socket)
      const user = new User()
      view.sync(user)
      setTimeout(() => (user.name = 'bar'), 1000)
      clients.push(user)
    })

    const el = document.createElement('div')
    document.body.appendChild(el)

    const clients = this.clients
    this.vue = new Vue({
      el,
      render: h => h(ServerControl),
      data() {
        return {
          clients,
        }
      },
    })
  }

  public destroy() {
    this.vue.$el.remove()
    this.vue.$destroy()
  }
}
