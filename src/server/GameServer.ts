import Database from './database/Database'
import NetworkScope from './network/NetworkScope'
import Player from './entities/Player'
import SocketServer from './network/SocketServer'
import Spawner from './entities/Spawner'
import WebServer from './network/WebServer'
import Enemy from './entities/Enemy'
import Mobile from './entities/Mobile'
import { tileDistance } from '../common/util/Geometry'
import Battle from './entities/Battle'
import Wizard from './entities/Wizard'
import Authentication from './network/Authentication'

export default class GameServer {
  private database = new Database()
  private webServer = new WebServer(this.database)
  private socketServer = new SocketServer(this.webServer)
  private config: Record<string, any> = {}
  private map?: Record<string, any> = {}
  private globalScope = new NetworkScope()
  private players = new Map<string, Player>()
  private wizards = new Map<string, Wizard>()
  private enemies: Enemy[] = []
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
    Authentication.init()

    await this.database.init()
    this.config = (await this.database.loadConfig()) ?? {}
    this.map = await this.database.getMap(this.config.defaultMap)

    this.socketServer.addScope(this.globalScope)

    this.socketServer.onAuth.observe(async (token, id, override) => {
      let client = await this.database.getUser(id)

      if (client instanceof Wizard && override) {
        const user = await this.database.getUser(override)

        if (user) {
          log.warn('Game', `Wizard (${client.id}) joined as ${user.id}`)
          client = user
        }
      }

      if (client instanceof Wizard) {
        log.warn('Game', `Wizard joined: ${client.id}`)

        this.wizards.set(client.id, client)
        this.socketServer.authResponse(token, client)
      } else if (client instanceof Player) {
        log.info('Game', `Player joined: ${client.name} (${client.id})`)
        client.sprite = this.config.playerSprite

        // Find a place for them
        if (this.map) {
          ;(() => {
            let x, y, l
            for (y = 0; y < this.map.height; y++) {
              for (x = 0; x < this.map.width; x++) {
                for (l = 0; l < this.map.layers.length; l++) {
                  if (!this.map.layers[l].data[y]) continue
                  if (!this.map.layers[l].data[y][x]) continue

                  if (this.map.layers[l].data[y][x].walkable) {
                    client.teleport(x, y)
                    return
                  }
                }
              }
            }
          })()
        }

        this.socketServer.authResponse(token, client)
        if (this.map) this.socketServer.sendMap(client.id, this.map)

        this.players.set(client.id, client)
        this.globalScope.addMobile(client)
        this.database.addPlayer(client)
      }
    })

    this.socketServer.onMessage.observe(async (id, type, data) => {
      if (type === 'wizard') {
        if (!this.wizards.get(id)) return

        if (data.type === 'maps') {
          this.socketServer.wizardData(
            id,
            data.type,
            await this.database.listMaps(),
          )
        } else if (data.type === 'map') {
          const map = await this.database.getMap(data.params)

          if (map) {
            this.socketServer.wizardData(id, data.type, {
              name: data.params,
              ...map,
            })
          }
        } else if (data.type === 'renameMap') {
          await this.database.renameMap(data.params.from, data.params.to)
        } else if (data.type === 'saveMap') {
          this.socketServer.wizardData(
            id,
            data.type,
            await this.database.saveMap(data.params.name, data.params),
          )
        } else if (data.type === 'sprites') {
          this.socketServer.wizardData(
            id,
            data.type,
            await this.database.listSprites(),
          )
        } else if (data.type === 'sprite') {
          const sprite = await this.database.getSprite(data.params)

          if (sprite) {
            this.socketServer.wizardData(id, data.type, {
              name: data.params,
              ...sprite,
            })
          }
        } else if (data.type === 'renameSprite') {
          await this.database.renameSprite(data.params.from, data.params.to)
        } else if (data.type === 'deleteSprite') {
          await this.database.deleteSprite(data.params)
        } else if (data.type === 'saveSprite') {
          this.socketServer.wizardData(
            id,
            data.type,
            await this.database.saveSprite(data.params.name, data.params),
          )
        } else if (data.type === 'enemies') {
          this.socketServer.wizardData(
            id,
            data.type,
            await this.database.listEnemies(),
          )
        } else if (data.type === 'enemy') {
          const enemy = await this.database.getEnemy(data.params)

          if (enemy) {
            this.socketServer.wizardData(id, data.type, {
              name: data.params,
              ...enemy,
            })
          }
        } else if (data.type === 'renameEnemy') {
          await this.database.renameEnemy(data.params.from, data.params.to)
        } else if (data.type === 'deleteEnemy') {
          await this.database.deleteEnemy(data.params)
        } else if (data.type === 'saveEnemy') {
          this.socketServer.wizardData(
            id,
            data.type,
            await this.database.saveEnemy(data.params.key, data.params),
          )
        } else if (data.type === 'users') {
          const users = await this.database.listUsers()

          const onlineUsers = users.map(user => {
            return {
              ...user,
              online: !!(
                this.players.get(user.id || '') ||
                this.wizards.get(user.id || '')
              ),
            }
          })

          this.socketServer.wizardData(id, data.type, onlineUsers)
        } else if (data.type === 'saveUser') {
          const existing =
            data.params.id != null &&
            (await this.database.getUser(data.params.id))

          if (existing) {
            this.socketServer.wizardData(
              id,
              data.type,
              await this.database.saveUser(existing.id, data.params),
            )
          } else {
            this.socketServer.wizardData(
              id,
              data.type,
              await this.database.createUser(data.params),
            )
          }
        } else if (data.type === 'config') {
          this.socketServer.wizardData(
            id,
            data.type,
            await this.database.loadConfig(),
          )
        } else if (data.type === 'saveConfig') {
          this.socketServer.wizardData(
            id,
            data.type,
            await this.database.saveConfig(data.params),
          )
        }
      }

      if (type === 'move') {
        const player = this.players.get(id)

        if (player) {
          const enemy = this.enemies.find(e => e.x === data.x && e.y === data.y)

          if (enemy) {
            player.teleport(player.x, player.y)
            new Battle(player, enemy)
            enemy.setState('aggro', player)
          } else {
            player.teleport(data.x, data.y)
          }
        }
      }
    })

    this.socketServer.onDisconnect.observe(id => {
      const player = this.players.get(id)
      const wizard = this.wizards.get(id)

      if (player) {
        log.info('Game', `Player destroyed: ${player.name} (${player.id})`)
        this.players.delete(id)
        this.globalScope.removeMobile(player)
        this.database.removePlayer(player)
      } else if (wizard) {
        log.info('Game', `Wizard disconnected`)
        this.wizards.delete(id)
      } else {
        log.error('Game', `Non-existent player disconnected: ${id}`)
      }
    })

    this.addSpawner([15, 15, 25, 25], 1, {
      name: 'Deerling',
      sprite: 'deer',
      hp: 50,
      str: 5,
      ai(state, map) {
        if (state.aggro) {
          const target: Mobile = state.aggro
          const distance = tileDistance(this.x, this.y, target.x, target.y)

          if (distance > 10) {
            state.aggro = false
          } else if (distance > 1) {
            if (Math.abs(this.x - target.x) > Math.abs(this.y - target.y)) {
              this.move(Math.sign(target.x - this.x), 0)
            } else {
              this.move(0, Math.sign(target.y - this.y))
            }

            return
          }

          return
        }

        let x = Math.round(Math.random() * 2 + 1 - 2)
        let y = Math.round(Math.random() * 2 + 1 - 2)

        if (this.x < 15) x = 1
        if (this.x > 25) x = -1

        if (this.y < 15) y = 1
        if (this.y > 25) y = -1

        if (x !== 0 && y !== 0) {
          if (Math.random() < 0.5) x = 0
          else y = 0
        }

        if (x === 0 && y === 0) {
          return
        }

        x = this.x + x
        y = this.y + y

        const walkable = map.layers.find(
          (l: any) => l.data[y] && l.data[y][x] && l.data[y][x].walkable,
        )
        if (walkable) {
          this.teleport(x, y)
        } else {
          log.out('Enemy', `Couldn't find walkable terrain (${x}, ${y})`)
        }
      },
    })

    setInterval(() => {
      this.spawners.forEach(spawner => {
        spawner.update(this.map || { layers: [] })
      })
    }, 1000)

    this.webServer.start()
  }

  public addSpawner(...args: ConstructorParameters<typeof Spawner>) {
    const spawner = new Spawner(...args)

    spawner.onSpawn.observe(mob => {
      log.out(
        'Entities',
        `Spawned ${mob.name} (${mob.id}) from #${spawner['id']}`,
      )
      this.globalScope.addMobile(mob)
      this.enemies.push(mob)
      mob.onDestroy.observe(() => {
        this.enemies = this.enemies.filter(e => e !== mob)
      })
    })

    spawner.seed(this.map || { layers: [] })

    this.spawners.push(spawner)
  }
}
