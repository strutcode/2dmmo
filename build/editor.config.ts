import { resolve } from 'path'
import webpack, { Configuration } from 'webpack'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'

export default function (mode: Configuration['mode']): Configuration {
  const config: Configuration = {
    mode,
    entry: ['./src/editor/index.ts'],
    target: 'web',
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: 'vue-loader',
        },
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
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        title: 'Editor',
      }),
    ],
    output: {
      path: resolve('./final/editor'),
      publicPath: '/editor',
      hotUpdateChunkFilename: '.hot/[id].[hash].hot-update.js',
      hotUpdateMainFilename: '.hot/[hash].hot-update.json',
    },
    devtool: '#inline-source-map',
  }

  if (mode === 'development') {
    ;(config.entry as string[]).unshift(
      'webpack-hot-middleware/client?path=/editor/__hmr',
    )
    config.plugins?.push(new webpack.HotModuleReplacementPlugin())
  } else {
    config.plugins?.push(new FriendlyErrorsWebpackPlugin())
  }

  return config
}
