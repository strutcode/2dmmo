import nano, { ServerScope, DocumentScope, MaybeDocument } from 'nano'
import Observable from '../../common/Observable'
import Player from '../entities/Player'
import Wizard from '../entities/Wizard'

interface DbPlayer extends MaybeDocument {
  username: string
  password: string
  salt: string
}

export default class Database {
  public onSync = new Observable()

  private connection: ServerScope
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

  public async getUser(id: string) {
    const wizards = this.connection.use<DbPlayer>('wizards')
    const wizard = await wizards.find({ selector: { _id: id } })

    if (wizard.docs[0]) {
      return new Wizard(wizard.docs[0]._id)
    }

    const players = this.connection.use<DbPlayer>('players')
    const player = await players.find({ selector: { _id: id } })

    if (player.docs[0]) {
      return new Player(player.docs[0]._id, {
        name: player.docs[0].username,
      })
    }

    return undefined
  }

  public async findUser(
    username: string,
  ): Promise<
    { id: string; username: string; password: string; salt: string } | undefined
  > {
    const players = this.connection.use<DbPlayer>('players')
    const result = await players.find({
      selector: {
        username,
      },
    })

    if (!result.docs[0]) {
      return undefined
    }

    return {
      id: result.docs[0]._id,
      username: result.docs[0].username,
      password: result.docs[0].password,
      salt: result.docs[0].salt,
    }
  }

  public async createUser(form: Record<string, any>) {
    const { username, password, salt } = form

    if (await this.findUser(username)) {
      return undefined
    }

    const players = this.connection.use<DbPlayer>('players')
    const insert = await players.insert({
      username,
      password,
      salt,
    } as DbPlayer)

    return {
      id: insert.id,
      username,
      password,
      salt,
    }
  }

  private syncPlayer(player: Player) {
    log.out('Database', `Sync player ${player.name} (${player.id})`)
  }
}
