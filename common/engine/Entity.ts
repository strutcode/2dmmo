import Component from './Component'

let gid = 1

export default class Entity {
  public id = gid++
  public components = new Map<typeof Component, Component[]>()

  public getComponents<T extends typeof Component>(type: T): InstanceType<T>[] {
    return (this.components.get(type) ?? []) as InstanceType<T>[]
  }

  public getComponent<T extends typeof Component>(
    type: T,
  ): InstanceType<T> | undefined {
    return (this.components.get(type) ?? [])[0] as InstanceType<T> | undefined
  }

  public hasComponent<T extends typeof Component>(type: T) {
    return (this.components.get(type)?.length ?? 0) > 0
  }
}
