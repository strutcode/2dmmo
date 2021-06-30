declare interface CardEntity {
  damage: (amount: number) => number
}

declare interface ActionCard {
  name: string
  execute: (owner: CardEntity, target?: CardEntity) => void
}
