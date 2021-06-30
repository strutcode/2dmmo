import Entity from '../../common/engine/Entity'

export default class BaseEffect {
  public params: Record<string, unknown> = {}

  constructor(public entity: Entity, public source?: Entity) {}

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
