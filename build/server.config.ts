import webpackNodeExternals from 'webpack-node-externals'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import { ChildProcess, fork } from 'child_process'
import webpack, { Compiler, Configuration } from 'webpack'

class ServerRunnerPlugin {
  private process?: ChildProcess

  apply(compiler: Compiler) {
    compiler.hooks.emit.tap('StartServer', () => {
      if (this.process) {
        this.process.kill()
      }

      console.log('Reloading server process...')
      this.process = fork('dist/server.js')
    })
  }
}

export default function(mode: Configuration['mode']): Configuration {
  const config: Configuration = {
    mode,
    entry: './src/server/index.ts',
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
    externals: [webpackNodeExternals()],
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new webpack.DefinePlugin({ BUILD_MODE: `'${mode}'` }),
    ],
    output: {
      filename: 'server.js',
    },
    devtool: 'cheap-module-source-map',
  }

  if (mode === 'development') {
    config.plugins?.push(new ServerRunnerPlugin())
  } else {
    config.plugins?.push(new webpack.ProgressPlugin())
  }

  return config
}
