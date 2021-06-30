import { readFileSync } from 'fs'
import { glob } from 'glob'
import System from '../../../common/engine/System'
import Inventory from '../components/Inventory'
import Input from '../components/Input'
import BaseEffect from '../BaseEffect'
import Affectable from '../components/Affectable'
import Mobile from '../components/Mobile'

export default class ActionCards extends System {
  private cards: ActionCard[] = []
  private effects: typeof BaseEffect[] = []

  public start() {
    const files = glob.sync('data/cards/*.json')

    // Load cards
    files.forEach((filename) => {
      const content = readFileSync(filename, { encoding: 'utf8' })
      const parsed = JSON.parse(content) as ActionCard[]

      this.cards = this.cards.concat(parsed)
    })

    console.log(`Read ${this.cards.length} action cards from disk`)

    // Load effects
    this.effects = glob
      .sync('../effects/*.js', { cwd: __dirname })
      .map((filename) => require(filename).default)

    console.log(`Read ${this.effects.length} effects from disk`)

    // Validate cards
    this.cards.forEach((card) => {
      Object.entries(card.effects).forEach(([name, props]) => {
        const Effect = this.effects.find((e) => e.name === name)

        // Ensure that the effect exists
        if (!Effect) {
          console.warn(
            `Effect '${name}' not found for card "${card.title}" [${card.id}]`,
          )
        }

        // TODO: Check props
      })
    })
  }

  public update() {
    this.engine.forEachComponent(Inventory, (inv) => {
      if (!inv.cards.length) {
        inv.cards = this.cards
      }
    })

    this.engine.forEachComponent(Input, (input) => {
      input.useQueue.forEach((use) => {
        const card = this.cards.find((c) => c.id === use.id)
        const other = this.engine.getEntity(use.target ?? -1)

        if (!other) {
          console.log('Invalid target')
        }

        input.entity.with(Mobile, (mobA) => {
          other?.with(Mobile, (mobB) => {
            console.log(`${mobA.name} used ${card?.title} on ${mobB.name}`)
          })
        })

        if (card) {
          other?.with(Affectable, (affectable) => {
            Object.entries(card.effects).forEach(([name, props]) => {
              const Effect = this.effects.find((e) => e.name === name)

              if (Effect) {
                affectable.addEffect(
                  new Effect(affectable.entity, input.entity),
                )
              } else {
                console.log(`Effect '${name}' not found`)
              }
            })
          })
        } else {
          console.warn(`Card '${use.id}' not found`)
        }
      })

      input.useQueue = []
    })
  }
}
