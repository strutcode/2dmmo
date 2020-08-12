import webpackNodeExternals from 'webpack-node-externals'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import { ChildProcess, fork } from 'child_process'
import webpack, { Compiler, Configuration } from 'webpack'
import { resolve } from 'path'

class ServerRunnerPlugin {
  private process?: ChildProcess

  apply(compiler: Compiler) {
    compiler.hooks.emit.tap('StartServer', () => {
      if (this.process) {
        this.process.kill()
      }

      console.log('Reloading server process...')
      this.process = fork('./final/server/main.js')
    })
  }
}

export default function (mode: Configuration['mode']): Configuration {
  const config: Configuration = {
    mode,
    entry: ['./src/server/index.ts'],
    target: 'async-node',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.json', '.ts'],
    },
    externals: [
      webpackNodeExternals({
        allowlist: [
          'webpack-hot-middleware/client',
          'webpack/hot/only-dev-server',
        ],
      }),
    ],
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new webpack.DefinePlugin({ BUILD_MODE: `'${mode}'` }),
    ],
    output: {
      path: resolve('./final/server'),
      hotUpdateChunkFilename: '.hot/[id].[hash].hot-update.js',
      hotUpdateMainFilename: '.hot/[hash].hot-update.json',
    },
    devtool: '#inline-source-map',
  }

  if (mode === 'development') {
    config.plugins?.push(new ServerRunnerPlugin())
    ;(config.entry as string[]).unshift(
      'webpack-hot-middleware/client',
      'webpack/hot/only-dev-server',
    )
    config.plugins?.push(new webpack.HotModuleReplacementPlugin())
  } else {
    config.plugins?.push(new webpack.ProgressPlugin())
  }

  return config
}
