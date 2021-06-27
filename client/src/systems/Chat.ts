import System from '../../../common/engine/System'
import ChatData from '../components/ChatData'
import InputQueue from '../components/InputQueue'

export default class Chat extends System {
  private window = document.createElement('div')
  private output = document.createElement('div')
  private input = document.createElement('input')

  public start() {
    this.window.id = 'chat'

    this.output.className = 'output'
    this.input.className = 'input'

    this.window.appendChild(this.output)
    this.window.appendChild(this.input)

    document.body.appendChild(this.window)
  }

  public update() {
    // Handle chat input commands
    this.engine.with(InputQueue, (input) => {
      input.actions.forEach((action) => {
        if (action === 'focus-chat') {
          this.toggleChat()
        }
      })
    })

    // Output incoming chat
    this.engine.with(ChatData, (chat) => {
      chat.incoming.forEach((msg) => {
        this.addOutput(msg)
      })
      chat.incoming = []
    })
  }

  private addOutput(message: string) {
    this.output.innerHTML += message + '<br />'

    // Scroll to bottom
    setTimeout(() => {
      this.output.scrollTop = this.output.scrollHeight
    })
  }

  private toggleChat() {
    if (this.input.matches(':focus')) {
      // If there's a message...
      if (this.input.value.length) {
        // Add the message to the send queue
        this.engine.with(ChatData, (chat) => {
          chat.outgoing.push(this.input.value)
        })
      }

      // Reset the input
      this.input.blur()
      this.input.value = ''
    } else {
      this.input.focus()
    }
  }
}
