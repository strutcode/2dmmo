import Component from './Component'

export default class Entity {
  public components = new Map<typeof Component, Component[]>()
}
