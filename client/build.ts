import path from 'path'
import webpack, { Configuration } from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const compiler = webpack({
  entry: ['./src/style.css', './src/index.ts'],
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
      favicon: './src/favico.png',
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
  proxy: {
    '/data': {
      target: 'http://server:9003',
      changeOrigin: true,
      ws: true,
    },
  },
})

server.listen(9002, () => {})
