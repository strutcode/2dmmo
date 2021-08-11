import path from 'path'
import webpack, { Configuration } from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'

const compiler = webpack({
  entry: ['regenerator-runtime', './src/index.ts'],
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { transpileOnly: true, appendTsSuffixTo: [/\.vue$/] },
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.scss', '.vue'],
  },
  plugins: [
    new VueLoaderPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      favicon: './src/favicon.png',
      inject: false,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /webpack-dev-server\/client\/utils\/createSocketUrl.js$/,
      path.resolve('./createSocketUrl.ts'),
    ),
  ],
  devtool: 'source-map',
} as Configuration)

if (process.argv.includes('dist')) {
  compiler.run(() => {})
} else {
  const server = new WebpackDevServer(compiler as any, {
    contentBase: 'dist',
    publicPath: '/',
    disableHostCheck: true,
    hot: true,
    sockPath: '/hmr',
    sockPort: 9004,
    proxy: {
      '/data': {
        target: 'http://server:9003',
        changeOrigin: true,
        ws: true,
      },
    },
  })

  server.listen(9004, '0.0.0.0')
}
