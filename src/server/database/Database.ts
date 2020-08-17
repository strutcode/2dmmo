import nano, { ServerScope, DocumentScope, MaybeDocument } from 'nano'
import Observable from '../../common/Observable'
import Player from '../entities/Player'
import Wizard from '../entities/Wizard'
import Uid from '../util/Uid'

interface DbPlayer extends MaybeDocument {
  username: string
  password: string
}

export default class Database {
  public onSync = new Observable()

  private gid = 0
  private connection: ServerScope
  private db!: DocumentScope<DbPlayer>
  private timers = new Map<string, NodeJS.Timeout>()

  public constructor() {
    this.connection = nano('http://root:test@db:5984')
  }

  public async init() {
    log.info('Database', 'Connecting to database...')

    const dbs = await this.connection.db.list()
    if (
      !dbs.includes('_users') ||
      !dbs.includes('_replicator') ||
      !dbs.includes('_global_changes')
    ) {
      log.warn('Database', `Missing system database(s)`)
      log.info('Database', 'Performing first time setup...')

      const dbCreates = []

      if (!dbs.includes('_users'))
        dbCreates.push(this.connection.db.create('_users'))
      if (!dbs.includes('_replicator'))
        dbCreates.push(this.connection.db.create('_replicator'))
      if (!dbs.includes('_global_changes'))
        dbCreates.push(this.connection.db.create('_global_changes'))

      await Promise.all(dbCreates)

      log.info('Database', 'System databases created!')
    }

    const gameDbs = ['players', 'wizards']
    await Promise.all(
      gameDbs.map(async name => {
        if (!dbs.includes(name)) {
          log.info('Database', `Creating store '${name}'...`)
          await this.connection.db.create(name)
        }
      }),
    )

    log.info('Database', 'Database connected')
  }

  public addPlayer(player: Player) {
    this.timers.set(
      player.id,
      setInterval(() => {
        this.syncPlayer(player)
      }, 5000),
    )
  }

  public removePlayer(player: Player) {
    const timer = this.timers.get(player.id)

    if (timer) {
      clearTimeout(timer)
      this.timers.delete(player.id)
    }
  }

  public async findUser(username: string, password: string): Promise<DbPlayer> {
    const players = this.connection.use<DbPlayer>('players')
    const result = await players.find({
      selector: {
        username,
        password,
      },
    })

    if (result.docs.length) {
      return result.docs[0]
    } else {
      const insert = await players.insert({
        username,
        password,
      } as DbPlayer)

      return {
        _id: insert.id,
        username,
        password,
      }
    }
  }

  public authenticate(input: string) {
    if (/auth=supersecret/.test(input)) {
      log.out('Database', 'Client authenticated as wizard')
      return new Wizard('w' + Uid.from(this.gid++))
    } else {
      log.out('Database', 'Client authenticated as player')
      return new Player(Uid.from(this.gid++))
    }
  }

  private syncPlayer(player: Player) {
    log.out('Database', `Sync player ${player.name} (${player.id})`)
  }
}
