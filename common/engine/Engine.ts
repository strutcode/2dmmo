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
  private componentChanges = {
    created: new Map<typeof Component, Component[]>(),
    updated: new Map<typeof Component, Component[]>(),
    deleted: new Map<typeof Component, Component[]>(),
  }

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
      // Construct the component
      const comp = new Proxy(new type(entity), {
        set: (t, p, v, r) => {
          this.register(this.componentChanges.updated, type, comp)
          return Reflect.set(t, p, v, r)
        }
      })

      // Register it on the entity
      this.register(entity.components, type, comp)
      
      // Register it in the engine
      this.register(this.components, type, comp)
      this.register(this.componentChanges.created, type, comp)
    })

    return entity
  }

  /** Removes and entity and all Components and resources associated with it */
  public destroyEntity(id: number): void
  public destroyEntity(entity: Entity): void
  public destroyEntity(input: number | Entity) {
    // Handle overloads
    const id = input instanceof Entity ? input.id : input
    const entity = this.getEntity(id)

    if (entity) {
      // Unregister each component from the engine
      for (const [type, instances] of entity.components.entries()) {
        instances.forEach(comp => {
          this.register(this.componentChanges.created, type, comp)
          this.unregister(this.components, type, comp)
        })
      }
    }

    // Unregister the entity
    this.entities.delete(id)
  }

  /** Returns all entities in this engine */
  public getEntities() {
    return [...this.entities.values()]
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

  /** Provides an array of created components of a type this tick */
  public getCreated<T extends typeof Component>(
    type: T,
  ): InstanceType<T>[] {
    return (this.componentChanges.created.get(type) ?? []) as InstanceType<T>[]
  }
    
  /** Provides an array of updated components of a type this tick */
  public getUpdated<T extends typeof Component>(
    type: T,
  ): InstanceType<T>[] {
    return (this.componentChanges.updated.get(type) ?? []) as InstanceType<T>[]
  }
    
  /** Provides an array of deleted components of a type this tick */
  public getDeleted<T extends typeof Component>(
    type: T,
  ): InstanceType<T>[] {
    return (this.componentChanges.deleted.get(type) ?? []) as InstanceType<T>[]
  }

  /** Iterates components of a given type and runs `callback` with each */
  public forEachComponent<T extends typeof Component>(
    type: T,
    callback: (component: InstanceType<T>) => void
  ) {
    this.iterate(this.components.get(type) as InstanceType<T>[], callback)
  }

  /** Iterates components of a given type that were created this tick */
  public forEachCreated<T extends typeof Component>(
    type: T,
    callback: (component: InstanceType<T>) => void
  ) {
    this.iterate(this.componentChanges.created.get(type) as InstanceType<T>[], callback)
  }

  /** Iterates components of a given type that were updated this tick */
  public forEachUpdated<T extends typeof Component>(
    type: T,
    callback: (component: InstanceType<T>) => void
  ) {
    this.iterate(this.componentChanges.updated.get(type) as InstanceType<T>[], callback)
  }

  /** Iterates components of a given type that were deleted this tick */
  public forEachDeleted<T extends typeof Component>(
    type: T,
    callback: (component: InstanceType<T>) => void
  ) {
    this.iterate(this.componentChanges.deleted.get(type) as InstanceType<T>[], callback)
  }

  /** Starts all systems and runs them continuously */
  public start() {
    // TODO: Need a better method for this
    setInterval(() => {
      this.update()
    }, 1 / 30)
  }

  /** Runs on every engine tick */
  public update() {
    // Clear change map
    this.componentChanges.created = new Map<typeof Component, Component[]>()
    this.componentChanges.updated = new Map<typeof Component, Component[]>()
    this.componentChanges.deleted = new Map<typeof Component, Component[]>()
    
    this.systems.forEach((system) => system.update())
  }

  /** A fast and safe way to add a component to a map */
  private register(collection: Map<typeof Component, Component[]>, key: typeof Component, value: Component) {
    const arr = collection.get(key) ?? []
    arr.push(value)
    collection.set(key, arr)
  }

  /** Removes an entry from the component map */
  private unregister(collection: Map<typeof Component, Component[]>, key: typeof Component, value: Component) {
    const comps = collection.get(key)

    if (comps) {
      // TODO: Major speed improvement needed here
      collection.set(
        key,
        comps.filter((c) => c !== value),
      )
    }
  }

  /** A fast and safe way to run a callback on every entry in a component map */
  private iterate<T>(collection: T[] | undefined, callback: (item: T) => void) {
    if (!collection) return

    for (let i in collection) {
      callback(collection[i])
    }
  }
}
