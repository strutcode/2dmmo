import { Server, createServer } from 'http'
import express, { Express } from 'express'
import CookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'

import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'
import clientConfig from '../../../build/client.config'
import { resolve } from 'path'
import { rmdirSync } from 'fs'
import webpack from 'webpack'
import editorConfig from '../../../build/editor.config'
import Observable from '../../common/Observable'
import Database from '../database/Database'
import Authentication from './Authentication'

export default class WebServer {
  public onLogin = new Observable<(user: string, pass: string) => void>()

  public httpServer: Server
  private app: Express

  constructor(private database: Database) {
    log.info('Network', 'Init express')
    this.app = express()

    this.app.use(express.static(resolve('./final/client')))
    this.app.use(express.json())
    this.app.use(CookieParser())

    log.info('Network', 'Init http server')
    this.httpServer = createServer(this.app)
  }

  public start() {
    if (BUILD_MODE === 'development') {
      this.applyDevMiddleware()
      this.enableEditor()
    }

    this.app.get('/auth', async (req, res) => {
      if (req.cookies['auth']) {
        try {
          const jwt = Authentication.verifyToken(req.cookies['auth'])

          if (jwt) {
            res.sendStatus(200)
          }
        } catch (e) {
          res.sendStatus(404)
        }
      }
    })

    this.app.post('/auth', async (req, res) => {
      const { username, password } = req.body

      if (req.body.signup) {
        log.out('Auth', `Signup: ${username}`)
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(password, salt)
        const result = await this.database.createUser({
          username,
          password: hash,
          salt,
        })

        if (result) {
          log.out('Auth', 'Signup complete')
          const jwt = Authentication.createToken(result.id)
          res.cookie('auth', jwt, { httpOnly: true })

          res.sendStatus(200)
          return
        } else {
          log.out('Auth', 'User already exists')
        }

        res.sendStatus(401)
      } else {
        log.out('Auth', `Login: ${username}`)
        const result = await this.database.findUser(username)

        if (result) {
          const challenge = await bcrypt.hash(password, result.salt)

          if (challenge === result.password) {
            log.out('Auth', 'Login successful')
            const jwt = Authentication.createToken(result.id)
            res.cookie('auth', jwt, { httpOnly: true })

            res.sendStatus(200)
            return
          } else {
            log.out('Auth', 'Password match failed')
          }
        } else {
          log.out('Auth', `No such user: ${username}`)
        }

        res.sendStatus(404)
      }
    })

    log.info('Network', 'Booting server...')
    this.httpServer.listen(9001, '0.0.0.0', () => {
      log.info('Network', 'OK - Listening for connections')
    })
  }

  public stop() {
    log.info('Network', 'Stopping server...')
    this.httpServer.close()
  }

  private enableEditor() {
    const compiler = webpack(editorConfig('development'))

    log.warn('Network', 'Enabling world editor...')
    rmdirSync(resolve('./final/editor/.hot'), {
      recursive: true,
    })

    this.app.use(
      WebpackDevMiddleware(compiler, {
        publicPath: '/editor',
        stats: 'errors-only',
        logLevel: 'silent',
      }),
    )

    this.app.use(
      WebpackHotMiddleware(compiler, {
        path: '/editor/__hmr',
      }),
    )

    this.app.use(express.static(resolve('./final/client')))
  }

  private applyDevMiddleware() {
    const compiler = webpack(clientConfig('development'))

    log.out('Server', 'Setup client hot module reloading...')
    rmdirSync(resolve('./final/client/.hot'), {
      recursive: true,
    })

    this.app.use(
      WebpackDevMiddleware(compiler, {
        publicPath: '/',
        stats: 'errors-only',
        logLevel: 'silent',
      }),
    )

    this.app.use(
      WebpackHotMiddleware(compiler, {
        path: '/__hmr',
      }),
    )
  }
}
