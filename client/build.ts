import path from 'path'
import webpack, { Configuration } from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const compiler = webpack({
  entry: './src/index.ts',
  mode: 'development',
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
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: true,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /webpack-dev-server\/client\/utils\/createSocketUrl.js$/,
      path.resolve('./createSocketUrl.ts'),
    ),
  ],
  devtool: 'source-map',
} as Configuration)

const server = new WebpackDevServer(compiler as any, {
  disableHostCheck: true,
  publicPath: '/',
  // port: 9002,
  sockPath: '/hmr',
  sockPort: 9002,
})

server.listen(9002, () => {})
