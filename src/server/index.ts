import Logger from './util/Logger'
import GameServer from './GameServer'

global.log = new Logger()

const server = new GameServer()

server.init()
