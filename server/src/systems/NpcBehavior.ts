import System from '../../../common/engine/System'
import Brain from '../components/Brain'

export default class NpcBehavior extends System {
  public update() {
    this.engine.forEachComponent(Brain, (brain) => {
      // Create uninitialized behaviors
      brain.behaviors.forEach((BehaviorProto, i) => {
        brain.activeBehaviors.push(new BehaviorProto(this.engine, brain.entity))
      })

      // Reset the list of behaviors to initialize
      brain.behaviors = []

      // Update active behaviors
      brain.activeBehaviors.forEach((behavior) => {
        behavior.tick()
      })
    })
  }
}
