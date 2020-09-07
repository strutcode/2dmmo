// let netId = 0
// function NetworkSync<T extends { new (...args: any[]): InstanceType<T> }>(
//   ...args: [T] | string[]
// ) {
//   if (typeof args[0] !== 'string') {
//     console.log('bare decorator', args[0])
//     return args[0]
//   } else {
//     return function(Base: T) {
//       console.log('props:', Base, args)
//       return Base
//     }
//   }
// }

// @NetworkSync
// class Foo {}

// @NetworkSync('x', 'y', 'hp')
// class Bar {}

// type foo = PropertyDecorator
// function sync(target: Object, prop: string | symbol) {
//   console.log(target, prop)
//   Object.defineProperty(target, prop, {
//     get() {
//       return target['_' + prop]
//     },
//     set(val) {
//       console.log('set', target, prop, val)
//       target['_' + prop] = val
//     },
//   })
// }

// class Foo {
//   @sync bar = '...'
//   baz = 42

//   constructor() {
//     console.log('construct')
//   }
// }
