import Protocol, { Packet } from '../../common/Protocol'

console.log('client start')

const socket = new WebSocket('ws://localhost:9003')
const keyMap: Record<string, string> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

window.addEventListener('keydown', (ev) => {
  if (socket.readyState !== WebSocket.OPEN) return

  if (!keyMap[ev.key]) return

  socket.send(
    Protocol.encode({
      type: 'input',
      key: keyMap[ev.key] as Packet['key'],
    }),
  )
})
