import Component from './Component'
import Entity from './Entity'
import System from './System'

type CreateEntityOptions = {
  id?: number
  components?: typeof Component[]
}

let gid = 1

/** The core class. Responsible for linking together Entities, Components and Systems. */
export default class Engine {
  private entities = new Map<number, Entity>()
  private components = new Map<typeof Component, Component[]>()
  private systems: System[] = []

  /** Enables a system in this engine */
  public addSystem(type: typeof System) {
    this.systems.push(new type(this))
  }

  /** Creates an entity and performs all necessary bookkeeping */
  public createEntity(options: CreateEntityOptions): Entity
  public createEntity(components: typeof Component[]): Entity
  public createEntity(options: CreateEntityOptions | typeof Component[]) {
    const entity = new Entity()

    // Handle overloads
    const normalizedOptions = Array.isArray(options)
      ? { components: options }
      : options

    // Set the entity's ID
    entity.id = normalizedOptions.id ?? gid++

    // Don't allow entities with the same ID
    if (this.entities.has(entity.id)) {
      throw new Error('Entity ID collision')
    }

    // Record the entity in this engine
    this.entities.set(entity.id, entity)

    // Create and register components
    normalizedOptions.components?.forEach((type) => {
      // COnstruct the component
      const comp = new type(entity)

      // Register it on the entity
      const comps = entity.components.get(type) ?? []
      comps.push(comp)
      entity.components.set(type, comps)

      // Register it in the engine
      const ngnComps = this.components.get(type) ?? []
      ngnComps.push(comp)
      this.components.set(type, ngnComps)
    })

    return entity
  }

  /** Removes and entity and all Components and resources associated with it */
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

  /** Returns an entity from its ID */
  public getEntity(id: number) {
    return this.entities.get(id)
  }

  /** Produces a list of every Component of a type across all entities from the prototype. May be an empty array. */
  public getAllComponents<T extends typeof Component>(
    type: T,
  ): InstanceType<T>[] {
    return (this.components.get(type) ?? []) as InstanceType<T>[]
  }

  /** Gets the first component of this prototype in the engine or undefined if none */
  public getComponent<T extends typeof Component>(
    type: T,
  ): InstanceType<T> | undefined {
    return (this.components.get(type) ?? [])[0] as InstanceType<T> | undefined
  }

  /** Starts all systems and runs them continuously */
  public start() {
    // TODO: Need a better method for this
    setInterval(() => {
      this.systems.forEach((system) => system.update())
    }, 1 / 30)
  }
}
