declare interface CardEntity {
  damage: (amount: number) => number
}

declare interface ActionCard {
  id: string
  title: string
  effects: {
    [name: string]: {
      [prop: string]: unknown
    }
  }[]
}
