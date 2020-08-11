import './global.css'

import GameClient from './GameClient'
import Logger from './util/Logger'

window.log = new Logger()

let client = new GameClient()

client.load()

if (module.hot) {
  module.hot.accept('./GameClient', () => {
    log.out('Game', 'Hot module reload')
    client.stop()
    client = new (require('./GameClient').default)()
    client.load()
  })
}
