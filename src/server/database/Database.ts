import { Tedis } from 'tedis'
import bcrypt from 'bcryptjs'

import Observable from '../../common/Observable'
import Player from '../entities/Player'
import Wizard from '../entities/Wizard'
import {
  readdir,
  readFile,
  access,
  writeFile,
  rename,
  unlink,
} from 'fs/promises'

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

      this.createUser(
        {
          username: 'admin',
          password: 'admin',
        },
        true,
      )
    }

    log.info('Database', 'Database connected')
  }

  public async loadConfig(): Promise<object | undefined> {
    const filename = `./data/config.json`

    try {
      const content = await readFile(filename, {
        encoding: 'utf8',
      })

      return JSON.parse(content)
    } catch (e) {
      log.error('Database', `Failed to load game config`)
      return undefined
    }
  }

  public async saveConfig(data: object) {
    const filename = `./data/config.json`

    try {
      log.out('Database', `Update game config`)
      await writeFile(filename, JSON.stringify(data, null, 2), {
        encoding: 'utf8',
      })

      return true
    } catch (e) {
      log.error('Database', `Failed to update game config`)
      return false
    }
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
        ;(user.wizard as any) = user.wizard === '1'

        return user
      }),
    )

    return users
  }

  public async findUser(username: string, password: string) {
    const id = await this.db.get(`uname2id:${username}`)

    if (id == null) return undefined

    const user = await this.db.hgetall(`user:${id}`)
    const challenge = await bcrypt.hash(password, user.salt)

    if (challenge !== user.password) {
      return undefined
    }

    delete user.password
    delete user.salt

    return user
  }

  public async createUser(form: Record<string, any>, wizard = false) {
    const { username, password } = form
    const id = String(this.id++)
    log.info('Database', `Create user ${id}`)

    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    await this.db.hmset(`user:${id}`, {
      id,
      username,
      password: passwordHash,
      salt,
      wizard: +wizard,
    })

    await this.db.sadd('users', id)
    await this.db.set(`uname2id:${form.username}`, id)
    await this.db.incr('userid')

    return {
      id,
      username,
      wizard,
    }
  }

  public async saveUser(id: string, params: Record<string, any>) {
    const { username, password, wizard } = params
    log.info('Database', `Update user ${id}`)

    if (username) await this.db.hset(`user:${id}`, 'username', username)
    if (password) {
      const salt = await bcrypt.genSalt()
      const passwordHash = await bcrypt.hash(password, salt)
      await this.db.hset(`user:${id}`, 'password', passwordHash)
    }
    if (wizard) await this.db.hset(`user:${id}`, 'wizard', wizard)

    return {
      id,
      username,
      wizard,
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
      const map = JSON.parse(content)

      return {
        ...map,
        name,
      }
    } catch (e) {
      log.error('Database', `Couldn't get map ${name}`)
      return undefined
    }
  }

  public async renameMap(oldName: string, newName: string): Promise<boolean> {
    try {
      await rename(`./data/maps/${oldName}.json`, `./data/maps/${newName}.json`)

      return true
    } catch (e) {
      log.error('Database', `Failed to rename map '${oldName}' -> '${newName}`)
      return false
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
      const enemy = JSON.parse(content)
      return {
        ...enemy,
        key: name,
      }
    } catch (e) {
      log.error('Database', `Couldn't get enemy ${name}`)
      return undefined
    }
  }

  public async saveEnemy(
    name: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    const filename = `./data/enemies/${name}.json`

    try {
      log.out('Database', `Update enemy '${name}'`)

      const saveData = { ...data }
      delete saveData.key

      await writeFile(filename, JSON.stringify(saveData, null, 2), {
        encoding: 'utf8',
      })

      return true
    } catch (e) {
      log.error('Database', `Failed to update enemy '${name}'`)
      return false
    }
  }

  public async renameEnemy(oldName: string, newName: string): Promise<boolean> {
    try {
      await rename(
        `./data/enemies/${oldName}.json`,
        `./data/enemies/${newName}.json`,
      )

      return true
    } catch (e) {
      log.error(
        'Database',
        `Failed to rename enemy '${oldName}' -> '${newName}`,
      )
      return false
    }
  }

  public async deleteEnemy(name: string): Promise<boolean> {
    try {
      await unlink(`./data/enemies/${name}.json`)

      return true
    } catch (e) {
      log.error('Database', `Failed to delete enemy '${name}'`)
      return false
    }
  }

  private async syncPlayer(player: Player) {
    // log.out('Database', `Sync player ${player.name} (${player.id})`)
  }
}
