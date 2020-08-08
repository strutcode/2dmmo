import express, { Express } from 'express'
import { createServer, Server } from 'http'
import { resolve } from 'path'
import webpack from 'webpack'
import { rmdirSync } from 'fs'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'
import clientConfig from '../../../build/client.config'

export default class WebServer {
  private app: Express
  public httpServer: Server

  constructor() {
    log.info('Init express')
    this.app = express()

    this.app.use(express.static(resolve('./final/client')))

    log.info('Init http server')
    this.httpServer = createServer(this.app)
  }

  public start() {
    if (BUILD_MODE === 'development') {
      this.applyDevMiddleware()
    }

    log.info('Booting server...')
    this.httpServer.listen(9001, '0.0.0.0', () => {
      log.info('Server up!')
    })
  }

  public stop() {
    log.info('Stopping server...')
    this.httpServer.close()
  }

  private applyDevMiddleware() {
    const compiler = webpack(clientConfig('development'))

    log.out('Cleanup HMR...')
    rmdirSync(resolve('./final/client/.hot'), {
      recursive: true,
    })

    log.out('Setup hot module reloading')
    this.app.use(
      WebpackDevMiddleware(compiler, {
        publicPath: '/',
        stats: 'errors-only',
        logLevel: 'silent',
      }),
    )

    this.app.use(WebpackHotMiddleware(compiler))
  }
}
