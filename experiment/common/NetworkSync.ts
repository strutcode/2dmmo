import ServerView from './ServerView'

const ParentsSymbol = Symbol('parents')
const ViewsSymbol = Symbol('views')
const FieldsSymbol = Symbol('fields')
const AddSymbol = Symbol('add')
const SetSymbol = Symbol('set')

// interface Networkable {
//   [AddSymbol]: (view: ClientView) => void
// }

function NetworkSync(...watchedFields: string[]) {
  let gid = 0

  return function <T extends { new(...args: any[]): {} }>(Base: T) {
    return class extends Base {
      constructor(...args: any[]) {
        super(...args)

        const type = Base.name
        const id = String(gid++)

        const views: ServerView[] = []
        const self = this as any

        self[AddSymbol] = (view: ServerView) => {
          const props = watchedFields.reduce((acc, name) => {
            acc[name] = self[name]
            return acc
          }, {} as Record<string, any>)

          view.add(type, id, props)
          views.push(view)
        }

        self[SetSymbol] = (newViews: ServerView[]) => {
          views.splice(0, views.length)

          newViews.forEach(view => {
            self[AddSymbol](view)
          })
        }

        // self[FieldsSymbol] = watchedFields

        self[ParentsSymbol] = null

        self[ViewsSymbol] = views

        const proxy = new Proxy(this, {
          set(obj, prop, value) {
            const change: Record<string, any> = {}

            console.log(type, 'set value', prop, value)
            // if (value[SetSymbol]) {
            //   console.log('set views on value')
            //   value[SetSymbol](views)
            // }

            if (watchedFields.includes(prop.toString())) {
              change[prop.toString()] = value
            }

            const maybeGetters = Object.getOwnPropertyDescriptors(
              Base.prototype,
            )
            Object.entries(maybeGetters).forEach(([field, desc]) => {
              if (desc.get) {
                change[field] = desc.get.call(obj)
              }
            })

            if (value[ParentsSymbol]) {
              value[ParentsSymbol] = self
            }

            let target = self
            while (target[ViewsSymbol].length) {
              console.log('notify', target)
              target[ViewsSymbol].forEach((view: ServerView) => {
                view.update(type, id, change)
              })

              target = target[ParentsSymbol]
            }

            self[prop] = value

            return true
          },
        })

        // watchedFields.forEach(field => {
        //   const desc = Object.getOwnPropertyDescriptor(this, field)
        //   if (!desc) return

        //   const parent = proxy as any
        //   console.log('child', field, desc.value)
        //   if (desc.value != null && desc.value[SetSymbol]) {
        //     console.log('set views on child')
        //     desc.value[SetSymbol](views)
        //   }

        //   if (!desc.get && Array.isArray(desc.value)) {
        //     parent[field] = new Proxy(desc.value, {
        //       set(obj, prop, value) {
        //         console.log('array set')

        //         obj[prop as any] = value
        //         parent[field] = parent[field]

        //         return true
        //       },
        //     })
        //   }
        // })

        // watchedFields.forEach(field => {
        //   if (self[field][ParentsSymbol]) {
        //     self[field][ParentsSymbol].push(self)
        //   }
        // })

        return proxy
      }
    }
  }
}

NetworkSync.objectMap = new Map<any, ServerView[]>()

NetworkSync.bindView = (obj: any, view: ServerView) => {
  if (obj[AddSymbol]) {
    obj[AddSymbol](view)
  } else {
    throw `Not a networked object!`
  }
  // if (NetworkSync.objectMap.has(obj)) {
  //   NetworkSync.objectMap.get(obj)?.push(view)
  // } else {
  //   NetworkSync.objectMap.set(obj, [view])
  // }
}

export default NetworkSync
