import { Server } from 'ws'

const wss = new Server({
  port: 9001,
})

wss.on('listening', () => {
  console.log('Server ready on port 9001')
})

wss.on('connection', (socket, req) => {
  const ip = req.socket.remoteAddress
  console.log(`Got connection from ${ip}`)

  socket.on('close', () => {
    console.log(`Lost connection from ${ip}`)
  })
})
