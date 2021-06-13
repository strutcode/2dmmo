type EventName = {
  playerJoin: {}
  playerLeave: {}
  characterJoin: {}
  characterLeave: {}
  characterMove: {}
}

export default class EventBus {
  public on<T extends keyof EventName>(
    ev: T,
    callback: (data: EventName[T]) => void,
  ) {}

  public emit<T extends keyof EventName>(ev: T, data: EventName[T]) {}
}
