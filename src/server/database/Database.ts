import { Tedis } from 'tedis'
import bcrypt from 'bcryptjs'

import Observable from '../../common/Observable'
import Player from '../entities/Player'
import Wizard from '../entities/Wizard'
import { readdir, readFile, stat, access, writeFile } from 'fs/promises'

export default class Database {
  public onSync = new Observable()

  private db: Tedis
  private timers = new Map<string, NodeJS.Timeout>()
  private id = 0

  public constructor() {
    this.db = new Tedis({ host: 'redis' })
  }

  public async init() {
    log.info('Database', 'Connecting to database...')

    this.id = Number((await this.db.get('userid')) || 0)

    const users = await this.db.smembers('users')

    if (!users.length) {
      log.warn('Database', 'No users, creating default wizard account')

      const salt = await bcrypt.genSalt()
      const password = await bcrypt.hash('admin', salt)

      this.createUser(
        {
          username: 'admin',
          password,
          salt,
        },
        true,
      )
    }

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
    const exists = await this.db.exists(`user:${id}`)

    if (!exists) return undefined

    const user = await this.db.hgetall(`user:${id}`)

    if (user) {
      if (+user.wizard) {
        return new Wizard(user.id)
      }

      return new Player(user.id, {
        name: user.username,
      })
    }
  }

  public async listUsers() {
    const ids = await this.db.smembers('users')

    const users = await Promise.all(
      ids.map(async id => {
        const user = await this.db.hgetall(`user:${id}`)

        delete user.password
        delete user.salt

        return user
      }),
    )

    return users
  }

  public async findUser(username: string) {
    const id = await this.db.get(`uname2id:${username}`)

    if (id == null) return undefined

    return this.db.hgetall(`user:${id}`)
  }

  public async createUser(form: Record<string, any>, wizard = false) {
    const id = String(this.id++)
    log.info('Database', `Create user ${id}`)

    await this.db.hmset(`user:${id}`, {
      id,
      ...form,
      wizard: +wizard,
    })

    await this.db.sadd('users', id)
    await this.db.set(`uname2id:${form.username}`, id)
    await this.db.incr('userid')

    return {
      id,
      ...form,
    }
  }

  public async listMaps() {
    const files = await readdir('./data/maps', {
      encoding: 'utf8',
    })

    return files.map(name => name.substr(0, name.length - 5))
  }

  public async getMap(name: string): Promise<object | undefined> {
    const filename = `./data/maps/${name}.json`

    try {
      await access(filename)

      const content = await readFile(filename, { encoding: 'utf8' })

      return JSON.parse(content)
    } catch (e) {
      log.error('Database', `Couldn't get map ${name}`)
      return undefined
    }
  }

  public async saveMap(name: string, data: object): Promise<boolean> {
    const filename = `./data/maps/${name}.json`

    try {
      log.out('Database', `Update map '${name}'`)
      await writeFile(filename, JSON.stringify(data, null, 2), {
        encoding: 'utf8',
      })

      return true
    } catch (e) {
      log.error('Database', `Failed to update map '${name}'`)
      return false
    }
  }

  public async listEnemies() {
    const files = await readdir('./data/enemies', {
      encoding: 'utf8',
    })

    return files.map(name => name.substr(0, name.length - 5))
  }

  public async getEnemy(name: string): Promise<object | undefined> {
    const filename = `./data/enemies/${name}.json`

    try {
      await access(filename)

      const content = await readFile(filename, { encoding: 'utf8' })

      return JSON.parse(content)
    } catch (e) {
      log.error('Database', `Couldn't get enemy ${name}`)
      return undefined
    }
  }

  public async saveEnemy(name: string, data: object): Promise<boolean> {
    const filename = `./data/enemies/${name}.json`

    try {
      log.out('Database', `Update enemy '${name}'`)
      await writeFile(filename, JSON.stringify(data, null, 2), {
        encoding: 'utf8',
      })

      return true
    } catch (e) {
      log.error('Database', `Failed to update enemy '${name}'`)
      return false
    }
  }

  private async syncPlayer(player: Player) {
    log.out('Database', `Sync player ${player.name} (${player.id})`)
  }
}
