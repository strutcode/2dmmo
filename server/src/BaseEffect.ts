import Entity from '../../common/engine/Entity'

export default class BaseEffect {
  constructor(public entity: Entity, public source?: Entity) {}

  public added() {}

  public tick() {}

  public removed() {}

  public destroy() {}
}
