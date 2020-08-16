import Logger from './util/Logger'
import GameServer from './GameServer'

global.log = new Logger()

log.out('Server', 'Bootstrap')
const server = new GameServer()

server.init()
