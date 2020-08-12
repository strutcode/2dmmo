import Database from './database/Database'
import Mobile from './entities/Mobile'
import NetworkScope from './network/NetworkScope'
import Player from './entities/Player'
import SocketServer from './network/SocketServer'
import Spawner from './entities/Spawner'
import WebServer from './network/WebServer'

export default class GameServer {
  private webServer = new WebServer()
  private socketServer = new SocketServer(this.webServer)
  private database = new Database()
  private globalScope = new NetworkScope()
  private players = new Map<string, Player>()
  private spawners: Spawner[] = []

  // public constructor() {
  //   if (module.hot) {
  //     log.info('Game', 'Enabling HMR')

  //     module.hot.accept(
  //       ['./network/SocketServer', './network/WebServer'],
  //       () => {
  //         log.info('Game', 'HMR')

  //         this.webServer = new (require('./network/WebServer').default)()
  //         this.socketServer = new (require('./network/SocketServer').default)(
  //           this.webServer,
  //         )
  //       },
  //     )
  //   }
  // }

  public async init() {
    await this.database.init()

    this.socketServer.addScope(this.globalScope)

    this.socketServer.onConnect.observe((id) => {
      const player = new Player(id)
      log.info('Game', `Player created: ${id}`)

      this.players.set(id, player)
      this.globalScope.addMobile(player)
    })

    this.socketServer.onMessage.observe((id, type, data) => {
      if (type === 'move') {
        const player = this.players.get(id)

        if (player) {
          player.teleport(data.x, data.y)
        }
      }
    })

    this.socketServer.onDisconnect.observe((id) => {
      const player = this.players.get(id)

      if (player) {
        log.info('Game', `Player destroyed: ${player.name} (${player.id})`)
        this.players.delete(id)
        this.globalScope.removeMobile(player)
      } else {
        log.error('Game', `Non-existent player disconnected: ${id}`)
      }
    })

    this.addSpawner([-10, -10, 10, 10], 10, {
      name: 'Deerling',
      sprite: 'deer',
      ai() {
        let x = Math.round(Math.random() * 2 + 1 - 2)
        let y = Math.round(Math.random() * 2 + 1 - 2)

        if (this.x < -10) x = 1
        if (this.x > 10) x = -1

        if (this.y < -10) y = 1
        if (this.y > 10) y = -1

        if (x !== 0 && y !== 0) {
          if (Math.random() < 0.5) x = 0
          else y = 0
        }

        if (x === 0 && y === 0) {
          return
        }

        this.move(x, y)
      },
    })

    setInterval(() => {
      this.spawners.forEach((spawner) => {
        spawner.update()
      })
    }, 10000)

    this.webServer.start()
  }

  public addSpawner(...args: ConstructorParameters<typeof Spawner>) {
    const spawner = new Spawner(...args)

    spawner.onSpawn.observe((mob) => {
      log.out(
        'Entities',
        `Spawned ${mob.name} (${mob.id}) from #${spawner['id']}`,
      )
      this.globalScope.addMobile(mob)
    })

    this.spawners.push(spawner)
  }
}
