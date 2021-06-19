import Protocol, { Packet } from '../../common/Protocol'

console.log('client start')

const socket = new WebSocket(`${location.origin.replace('http', 'ws')}/data`)
const keyMap: Record<string, string> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

socket.addEventListener('open', () => {
  let pingTime = 0

  setInterval(() => {
    pingTime = performance.now()
    socket.send(Protocol.encode({ type: 'ping' }))
  }, 5000)

  socket.addEventListener('message', (msg) => {
    const now = performance.now()
    const packet = Protocol.decode(msg.data)

    if (packet.type === 'ping') {
      console.log(`latency: ${now - pingTime}ms`)
    }
  })
})

window.addEventListener('keydown', (ev) => {
  if (socket.readyState !== WebSocket.OPEN) return

  if (!keyMap[ev.key]) return

  socket.send(
    Protocol.encode({
      type: 'input',
      key: keyMap[ev.key],
    }),
  )
})
