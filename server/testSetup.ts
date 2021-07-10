import Chai from 'chai'
import Sinon from 'sinon'
import SinonChai from 'sinon-chai'

Chai.use(SinonChai)

Object.assign(globalThis, {
  expect: Chai.expect,
  Sinon,
})
