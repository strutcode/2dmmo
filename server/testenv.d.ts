import { ExpectStatic } from 'chai'
import { SinonStatic } from 'sinon'

declare global {
  const expect: ExpectStatic
  const Sinon: SinonStatic
}
