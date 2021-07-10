import Chai from 'chai'
import { SinonStatic } from 'sinon'

declare global {
  const expect: Chai.ExpectStatic
  const Sinon: SinonStatic
}
