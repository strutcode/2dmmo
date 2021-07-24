import System from '../../../common/engine/System'
import Listener from '../components/Listener'
import Speaker from '../components/Speaker'

export default class Chat extends System {
  public update() {
    this.engine.forEachComponent(Listener, (listener) => {
      listener.history = listener.history.concat(listener.incoming)
      listener.incoming = []

      this.engine.forEachComponent(Speaker, (speaker) => {
        speaker.outgoing.forEach((words) => {
          listener.hear(speaker.entity.id, words)
        })
      })
    })

    this.engine.forEachComponent(Speaker, (speaker) => {
      speaker.outgoing = []
    })
  }
}
