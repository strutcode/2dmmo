import System from '../../../common/engine/System'
import WebSocket, { Server } from 'ws'
import EditorProtocol from '../../../common/EditorProtocol'
import { glob } from 'glob'
import { basename } from 'path'
import { readFileSync } from 'fs'

/** This system handles all network communication queued up by other systems */
export default class EditorServer extends System {
  /** The main socket server */
  private wss?: Server

  public start() {
    // Init server
    console.log('Starting editor server...')
    this.wss = new Server({
      port: 9005,
    })

    // Logging
    this.wss.on('listening', () => {
      console.log('Editor available on port 9005')
    })

    // When a player connects...
    this.wss.on('connection', async (socket, req) => {
      const ip = req.socket.remoteAddress

      console.log(`Got editor connection from ${ip}`)

      // When the client sends data...
      socket.on('message', (data) => {
        // Safety check
        if (typeof data !== 'string') {
          return
        }

        // Get the decoded data
        const packet = EditorProtocol.decode(data)

        switch (packet.type) {
          case 'listQuests':
            const files = glob.sync('./data/quests/*')

            this.send(socket, {
              type: 'listQuests',
              entries: files.map((filename) => {
                return {
                  name: basename(filename).replace('.json', ''),
                }
              }),
            })
            break
          case 'questContent':
            const content = readFileSync(`./data/quests/${packet.name}.json`, {
              encoding: 'utf8',
            })

            this.send(socket, {
              type: 'questContent',
              name: packet.name,
              content,
            })
            break
        }
      })

      // When the player disconnects
      socket.on('close', () => {
        console.log(`Lost editor connection from ${ip}`)
      })
    })
  }

  protected send(
    socket: WebSocket,
    ...data: Parameters<typeof EditorProtocol['encode']>
  ) {
    if (socket.readyState !== WebSocket.OPEN) {
      return
    }

    socket.send(EditorProtocol.encode(...data))
  }
}
