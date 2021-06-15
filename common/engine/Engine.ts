import Component from './Component'
import Entity from './Entity'
import System from './System'

export default class Engine {
  private components = new Map<typeof Component, Component[]>()

  public addSystem(type: typeof System) {
    new type(this)
  }

  public createEntity() {
    return new Entity()
  }

  public getAllComponents<T extends typeof Component>(
    type: T,
  ): InstanceType<T>[] {
    return (this.components.get(type) ?? []) as InstanceType<T>[]
  }
}
