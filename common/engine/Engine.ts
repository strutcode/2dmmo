import Component from './Component'
import Entity from './Entity'
import System from './System'

export default class Engine {
  private components = new Map<typeof Component, Component[]>()
  private systems: System[] = []

  public addSystem(type: typeof System) {
    this.systems.push(new type(this))
  }

  public createEntity(components: typeof Component[]) {
    const entity = new Entity()

    components.forEach((type) => {
      const comp = new type(entity)

      const comps = entity.components.get(type) ?? []
      comps.push(comp)
      entity.components.set(type, comps)

      const ngnComps = this.components.get(type) ?? []
      ngnComps.push(comp)
      this.components.set(type, ngnComps)
    })

    return entity
  }

  public getAllComponents<T extends typeof Component>(
    type: T,
  ): InstanceType<T>[] {
    return (this.components.get(type) ?? []) as InstanceType<T>[]
  }

  public start() {
    setInterval(() => {
      this.systems.forEach((system) => system.update())
    }, 1 / 30)
  }
}
