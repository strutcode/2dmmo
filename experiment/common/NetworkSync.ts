type OnAddCallback = (
  type: string,
  id: string,
  props: Record<string, any>,
) => void

type OnUpdateCallback = (
  type: string,
  id: string,
  name: string,
  value: any,
) => void

function NetworkSync(...watchedFields: string[]) {
  let gid = 0

  return function<T extends { new (...args: any[]): {} }>(Base: T) {
    return class extends Base {
      constructor(...args: any[]) {
        super(...args)

        // console.log('construct', Base, this)

        const id = String(gid++)

        const props = watchedFields.reduce((acc, name) => {
          acc[name] = (this as any)[name]
          return acc
        }, {} as Record<string, any>)

        NetworkSync.listeners.add.forEach(listener =>
          listener(Base.name, id, props),
        )

        const obj = new Proxy(this, {
          set(obj, prop, value) {
            // console.log(obj)
            // console.log(Base.prototype)

            // const descriptors = {
            //   ...Object.getOwnPropertyDescriptors(obj),
            //   ...Object.getOwnPropertyDescriptors(Base.prototype),
            // }

            // console.log(descriptors)

            NetworkSync.listeners.update.forEach(listener =>
              listener(Base.name, id, prop.toString(), value),
            )
            ;(obj as any)[prop] = value

            return true
          },
        })

        NetworkSync.objectMap.set(obj, id)

        return obj
      }
    }
  }
}

NetworkSync.objectMap = new Map<any, string>()

NetworkSync.listeners = {
  add: [] as OnAddCallback[],
  update: [] as OnUpdateCallback[],
}

NetworkSync.onAdd = (callback: OnAddCallback) => {
  NetworkSync.listeners.add.push(callback)
}

NetworkSync.onUpdate = (callback: OnUpdateCallback) => {
  NetworkSync.listeners.update.push(callback)
}

export default NetworkSync
