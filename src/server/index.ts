import Logger from './util/Logger'
import GameServer from './network/GameServer'

global.log = new Logger()

new GameServer()
