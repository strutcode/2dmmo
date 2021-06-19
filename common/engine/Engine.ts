import Component from './Component'
import Entity from './Entity'
import System from './System'

type CreateEntityOptions = {
  id?: number
  components?: typeof Component[]
}

let gid = 1

export default class Engine {
  private entities = new Map<number, Entity>()
  private components = new Map<typeof Component, Component[]>()
  private systems: System[] = []

  public addSystem(type: typeof System) {
    this.systems.push(new type(this))
  }

  public createEntity(options: CreateEntityOptions): Entity
  public createEntity(components: typeof Component[]): Entity
  public createEntity(options: CreateEntityOptions | typeof Component[]) {
    const entity = new Entity()

    const normalizedOptions = Array.isArray(options)
      ? { components: options }
      : options

    entity.id = normalizedOptions.id ?? gid++

    if (this.entities.has(entity.id)) {
      throw new Error('Entity ID collision')
    }

    this.entities.set(entity.id, entity)

    normalizedOptions.components?.forEach((type) => {
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

  public destroyEntity(id: number): void
  public destroyEntity(entity: Entity): void
  public destroyEntity(input: number | Entity) {
    const id = input instanceof Entity ? input.id : input
    const entity = this.getEntity(id)

    if (entity) {
      for (const [type, instances] of entity.components.entries()) {
        const comps = this.components.get(type)

        if (comps) {
          this.components.set(
            type,
            comps.filter((c) => !instances.includes(c)),
          )
        }
      }
    }

    this.entities.delete(id)
  }

  public getEntity(id: number) {
    return this.entities.get(id)
  }

  public getAllComponents<T extends typeof Component>(
    type: T,
  ): InstanceType<T>[] {
    return (this.components.get(type) ?? []) as InstanceType<T>[]
  }

  public getComponent<T extends typeof Component>(
    type: T,
  ): InstanceType<T> | undefined {
    return (this.components.get(type) ?? [])[0] as InstanceType<T> | undefined
  }

  public start() {
    setInterval(() => {
      this.systems.forEach((system) => system.update())
    }, 1 / 30)
  }
}
