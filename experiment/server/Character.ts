import Container from './Container'
import NetworkSync from '../common/NetworkSync'

@NetworkSync('name', 'hp', 'hpMax', 'inventory')
export default class Character {
  public name = 'Soandso'
  public hp = 100
  public hpMax = 100
  public inventory = new Container()
}
