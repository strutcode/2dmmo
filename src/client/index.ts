import './global.css'
import GameClient from './GameClient'

let client = new GameClient()

client.load()

if (module.hot) {
  module.hot.accept('./GameClient', () => {
    console.log('reload client')
    client.stop()
    client = new (require('./GameClient').default)()
    client.load()
  })
}
