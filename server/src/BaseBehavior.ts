import Engine from '../../common/engine/Engine'
import Entity from '../../common/engine/Entity'

export default class BaseBehavior {
  public params: Record<string, unknown> = {}

  protected ownerId = -1

  constructor(protected engine: Engine, entity: Entity) {
    this.ownerId = entity.id
  }

  /** The entity which owns this behavior */
  public get entity() {
    return this.engine.getEntity(this.ownerId)
  }

  /** Called when the behavior is added to an entity */
  public start() {}

  /** Called once per game update */
  public tick() {}
}
