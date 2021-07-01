import Engine from '../../common/engine/Engine'
import Entity from '../../common/engine/Entity'

export default class BaseEffect {
  public params: Record<string, unknown> = {}

  protected ownerId = -1
  protected sourceId = -1

  constructor(protected engine: Engine, entity: Entity, source?: Entity) {
    this.ownerId = entity.id
    if (source) this.sourceId = source.id
  }

  /** The entity which owns this effect */
  public get entity() {
    return this.engine.getEntity(this.ownerId)
  }

  /** The entity which applied this effect */
  public get source() {
    return this.engine.getEntity(this.sourceId)
  }

  /** Called when the effect is added to an entity */
  public start() {}

  /** Called once per game update */
  public tick() {}

  /** called when this effect is removed from an entity */
  public end() {}

  /** Called when another effect is added to this entity */
  public added(other: BaseEffect) {}

  /** Called when another effect is removed from this entity */
  public removed(other: BaseEffect) {}

  /** Removes this effect from the entity and cleans up resources */
  public destroy() {}
}
