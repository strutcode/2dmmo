import { expect } from 'chai'
import 'mocha'

const SyncSymbol = Symbol('sync')

type ClassType = { new (...args: any[]): any }
type Wrapped<T extends ClassType> = {
  [SyncSymbol]: {}
} & InstanceType<T>
type Proxifier<T extends ClassType> = T &
  ((...args: ConstructorParameters<T>) => Wrapped<T>)

function proxify(obj, id) {
  // Create proxy object
  // Network ID and prototype
  // Synced fields or optionally all
  // Take an existing id, if available
  // Recursively init synced fields?
}

function NetworkSyncy<T extends ClassType>(
  ...args: string[]
): (Base: T) => Proxifier<T>
function NetworkSyncy<T extends ClassType>(Base: T): Proxifier<T>
function NetworkSyncy<T extends ClassType>(
  Base: T | string,
  ...rest: string[]
): Proxifier<T> | ((Base: T) => Proxifier<T>) {
  // Proxify constructor

  if (typeof Base === 'string') {
    return function (Base: T) {
      return function (...args: ConstructorParameters<typeof Base>) {
        const inst: InstanceType<T> = new Base(...args)
        return proxify(inst, id)
      } as Wrapped<T>
    }
  }

  return function (...args: ConstructorParameters<typeof Base>) {
    const inst: Wrapped<typeof Base> = new Base(...args)
    return inst
  } as Wrapped<T>
}

class NetEventBus {
  // Receive events and determine which views they apply to
  // Allow views to register for updates to objects
}

class NetworkViewy {
  // Watch for field set and init/update listeners
  // Deserialize updates from the socket and apply them
  // Accept registration of prototypes
}

@NetworkSyncy
class Foo {}

@NetworkSyncy('foo', 'bar')
class Bar {
  foo = 42
  bar = 'dglk'
}

const mochaDiv = document.createElement('div')
mochaDiv.id = 'mocha'
document.body.appendChild(mochaDiv)
mocha.setup('bdd')

describe('proxify', () => {
  it('creates a proxy object', () => {
    expect(proxify({}, 1)).to.be.an.instanceOf(Proxy)
  })

  it('proxifies synced fields')

  it('can proxify all fields')

  it('ignores already proxied objects')

  it('records the proxy prototype')

  it('recursively proxifies objects')

  it('recursively proxifies arrays')
})

describe('NetworkSync', () => {
  it('proxifies top level properties')

  it('handles synced children')
})

describe('NetEventBus', () => {
  it('receives all updates')

  it('delegates events to the right views')
})

describe('NetworkView', () => {
  it('listens for updates to assigned objects')

  it('recursively listens to updates in children')

  it('receives updates and syncs itself')

  it('sets the prototype of synced objects')
})

mocha.run()
