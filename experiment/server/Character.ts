import NetworkSync from '../common/NetworkSync'

@NetworkSync('name', 'hp', 'hpMax')
export default class Character {
  public name = 'Soandso'
  public hp = 100
  public hpMax = 100
}
