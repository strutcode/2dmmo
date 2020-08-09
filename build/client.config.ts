import { resolve } from 'path'
import webpack, { Configuration } from 'webpack'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default function (mode: Configuration['mode']): Configuration {
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
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.png$/,
          use: {
            loader: 'file-loader',
            options: {
              outputPath: 'assets',
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts'],
    },
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'Game',
      }),
    ],
    output: {
      path: resolve('./final/client'),
      // publicPath: './',
      hotUpdateChunkFilename: '.hot/[id].[hash].hot-update.js',
      hotUpdateMainFilename: '.hot/[hash].hot-update.json',
    },
    devtool: 'cheap-module-source-map',
  }

  if (mode === 'development') {
    ; (config.entry as string[]).unshift('webpack-hot-middleware/client?path=__webpack_hmr')
    config.plugins?.push(new webpack.HotModuleReplacementPlugin())
  }

  return config
}
