import { Server, createServer } from 'http'
import express, { Express } from 'express'

import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'
import clientConfig from '../../../build/client.config'
import { resolve } from 'path'
import { rmdirSync } from 'fs'
import webpack from 'webpack'

export default class WebServer {
  private app: Express
  public httpServer: Server

  constructor() {
    log.info('Server', 'Init express')
    this.app = express()

    this.app.use(express.static(resolve('./final/client')))

    log.info('Server', 'Init http server')
    this.httpServer = createServer(this.app)
  }

  public start() {
    if (BUILD_MODE === 'development') {
      this.applyDevMiddleware()
    }

    log.info('Server', 'Booting server...')
    this.httpServer.listen(9001, '0.0.0.0', () => {
      log.info('Server', 'OK - Listening for connections')
    })
  }

  public stop() {
    log.info('Server', 'Stopping server...')
    this.httpServer.close()
  }

  private applyDevMiddleware() {
    const config = clientConfig('development')
    config.plugins = config.plugins?.filter(
      (p) => !(p instanceof FriendlyErrorsWebpackPlugin),
    )

    const compiler = webpack(config)

    log.out('Server', 'Cleanup HMR...')
    rmdirSync(resolve('./final/client/.hot'), {
      recursive: true,
    })

    log.out('Server', 'Setup hot module reloading')
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
