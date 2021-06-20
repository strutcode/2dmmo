import { resolve } from 'path'
import webpack, { Configuration } from 'webpack'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import WebpackDevServer from 'webpack-dev-server'
import { VueLoaderPlugin } from 'vue-loader'

const compiler = webpack({
  mode: 'development',
  entry: './dialoguesys/index.ts',
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
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.ts'],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: 'Dialogue',
    }),
  ],
  output: {
    path: resolve('./dialoguesys/dist'),
    publicPath: '/',
  },
  devtool: '#inline-source-map',
})

const devServer = new WebpackDevServer(compiler, {
  hot: true,
})

devServer.listen(8080)
