import { resolve } from 'path'
import webpack, { Configuration } from 'webpack'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default function(mode: Configuration['mode']): Configuration {
  const config: Configuration = {
    mode,
    entry: ['./src/client/index.ts'],
    target: 'web',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts', '.vue'],
    },
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'Game',
      }),
    ],
    output: {
      path: resolve('./dist/client'),
      publicPath: '/',
      hotUpdateChunkFilename: '.hot/[id].[hash].hot-update.js',
      hotUpdateMainFilename: '.hot/[hash].hot-update.json',
    },
    devtool: 'cheap-module-source-map',
  }

  return config
}
