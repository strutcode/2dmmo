import Vue from 'vue'
import { VNode } from 'vue/types/umd'
import dialect from './dialects'

const el = document.body
const content = `Hello. Welcome to Crow's Tavern.
[exclamation]! You don't know what you've done!
Hey you! Come here. I want to talk to you.
Tell me, do you know the way to Crow's Tavern?`

new Vue({
  el,
  data: {
    content,
    dialect: 'fancy',
  },
  computed: {
    output(): string {
      return dialect(this.content, this.dialect)
    },
  },
  render(h): VNode {
    return h(
      'div',
      {
        style: 'padding: 1em',
      },
      [
        h('textarea', {
          domProps: { value: this.content, rows: 10, cols: 80 },
          on: {
            input: (ev: InputEvent) => {
              if (ev.target instanceof HTMLTextAreaElement) {
                this.content = ev.target.value
              }
            },
          },
        }),
        h('div', [
          h(
            'select',
            {
              domProps: { value: this.dialect },
              on: {
                input: (ev: InputEvent) => {
                  if (ev.target instanceof HTMLSelectElement) {
                    this.dialect = ev.target.value
                  }
                },
              },
            },
            dialect.list.map((name) => h('option', name)),
          ),
        ]),
        h('pre', this.output),
      ],
    )
  },
})