import webpack from 'webpack'
import serverConfig from './server.config'
import clientConfig from './client.config'
import editorConfig from './editor.config'

const watchMode = process.argv.includes('watch')
const mode = watchMode ? 'development' : 'production'

const compiler = webpack([
  serverConfig(mode),
  clientConfig(mode),
  editorConfig(mode),
])

if (watchMode) {
  compiler.watch({}, () => {})
} else {
  compiler.run(() => {})
}
