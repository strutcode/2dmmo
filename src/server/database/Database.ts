import nano, { ServerScope } from 'nano'

export default class Database {
  private connection: ServerScope

  constructor() {
    this.connection = nano('http://root:test@db:5984')
  }

  async init() {
    const db = this.connection

    log.info('Database', 'Connecting to database...')

    const dbs = await this.connection.db.list()
    if (
      !dbs.includes('_users') ||
      !dbs.includes('_replicator') ||
      !dbs.includes('_global_changes')
    ) {
      log.warn('Database', `Missing system database(s)`)
      log.info('Database', 'Performing first time setup...')

      await Promise.all([
        this.connection.db.destroy('_users'),
        this.connection.db.destroy('_replicator'),
        this.connection.db.destroy('_global_changes'),
        this.connection.db.create('_users'),
        this.connection.db.create('_replicator'),
        this.connection.db.create('_global_changes'),
      ])

      log.info('Database', 'System databases created!')
    }

    const gameDbs = ['players']
    await Promise.all(
      gameDbs.map(async (name) => {
        if (!dbs.includes(name)) {
          log.info('Database', `Creating store '${name}'...`)
          await this.connection.db.create(name)
        }
      }),
    )

    log.info('Database', 'Database connected')
  }
}
